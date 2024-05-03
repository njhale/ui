export const dynamic = 'force-dynamic' // defaults to auto
import { NextRequest } from 'next/server'
import { parse, stringify, type Block, Text } from '@gptscript-ai/gptscript'
import { promises as fs } from 'fs';
import path from 'path';
import type {
    Node as RFNode, 
    Edge as RFEdge,
    XYPosition,
} from 'reactflow';

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
)  {
    const scriptsPath = process.env.SCRIPTS_PATH || 'gptscripts'
    try {
        const { name } = params as any;
        const script = await parse(path.join(scriptsPath,`${name}.gpt`));
        if (req.nextUrl.searchParams.get('nodeify') === 'true') {
            const { nodes, edges } = await nodeify(script);
            return Response.json({ nodes: nodes, edges: edges });
        }
        return Response.json(script);
    } catch (e) {
        if (`${e}`.includes('no such file')){
            return Response.json({ error: '.gpt file not found' }, { status: 404 });
        } 
        return Response.json({ error: e }, {status: 500});
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { slug: string } }
)  {
    try {
        const scriptsPath = process.env.SCRIPTS_PATH || 'gptscripts'
        const { name } = params as any;
        const nodes = (await req.json()) as RFNode[];
        const script = denodeify(nodes);

        await fs.writeFile(path.join(scriptsPath,`${name}.gpt`), await stringify(script));
        return Response.json(await parse(path.join(scriptsPath,`${name}.gpt`)));
    } catch (e) {
        if (`${e}`.includes('no such file')){
            return Response.json({ error: '.gpt file not found' }, { status: 404 });
        } 
        return Response.json({ error: e }, {status: 500});
    }
}

type Positions = {
    [key: string]: XYPosition;
}

const nodeGraphIndex = 0;
const nodeify = async (script: Block[]) => {
    try {
        const nodes: RFNode[] = [];
        const edges: RFEdge[] = [];

        if (script.length === 0) return {nodes, edges};
        const nodeGraphText = script[nodeGraphIndex] as Text;
        const positions = nodeGraphText.content ? JSON.parse(nodeGraphText.content) as Positions : {};

        for (let block of script) {
            if (block.type === 'text') continue;
            const name = block.name ? block.name : 'main';
            nodes.push({
                id: name,
                position: positions[name] ? positions[name] : { x: 0, y: 0 },
                data: block,
                type: block.name ? 'customTool': 'chat',
            })
            
            if (!block.tools || !block.tools.length) continue;

            for (let tool of block.tools) {
                edges.push({
                    id: `${name}-${tool}`,
                    source: name,
                    target: tool,
                    animated: true,
                })
            }
        }
        return { nodes: nodes, edges: edges };
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const denodeify = (nodes: RFNode[]): Block[] => {
    try {
        let script: Block[] = [];
        let positions: Positions = {};

        if (nodes.length === 0) return script;
        for (let node of nodes) {
            const { id, position, data } = node;
            positions[id] = position
            script.push(data as Block);
        }
        script.unshift({ 
            id: 'nodeGraph', 
            format:'nodeGraph', 
            type: 'text', 
            content: JSON.stringify(positions)+'\n'
        });
        return script;
    } catch (e) {
        console.error(e);
        throw e;
    }
}