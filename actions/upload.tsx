"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { WORKSPACE_DIR } from '@/config/env';
import { Dirent } from 'fs';

export async function uploadFile(formData: FormData) {
    const workspaceDir = WORKSPACE_DIR()
    await fs.mkdir(workspaceDir, { recursive: true })

    const file = formData.get("file") as File;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    await fs.writeFile(path.join(workspaceDir, file.name), buffer);

    revalidatePath("/");
}

export async function deleteFile(path: string) {
    try {
        await fs.unlink(path);
        revalidatePath("/");
    } catch (error) {
        console.error("Error deleting file:", error);
    }
}

export async function lsWorkspaceFiles(): Promise<string> {
    let files: Dirent[] = []
    try {
        const dirents = await fs.readdir(WORKSPACE_DIR(), { withFileTypes: true });
        files = dirents.filter((dirent: Dirent) => !dirent.isDirectory());
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw e;
        }
    }

    return JSON.stringify(files);
}
