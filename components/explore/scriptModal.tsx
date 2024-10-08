'use client';

import {
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Button,
  Link,
  Divider,
  Accordion,
  AccordionItem,
  Chip,
  Tooltip,
  Table,
  TableHeader,
  TableColumn,
  TableRow,
  TableCell,
  TableBody,
} from '@nextui-org/react';
import { deleteScript, ParsedScript } from '@/actions/me/scripts';
import { GoPencil, GoTrash } from 'react-icons/go';
import { AuthContext } from '@/contexts/auth';
import { useCallback, useContext, useState } from 'react';
import { TbListDetails } from 'react-icons/tb';
import { LiaExpandArrowsAltSolid } from 'react-icons/lia';
import { CiStar } from 'react-icons/ci';
import { IoStarSharp } from 'react-icons/io5';
import { ChatContext } from '@/contexts/chat';
import { LuMessageSquare } from 'react-icons/lu';

interface ScriptModalProps {
  className?: string;
  script: ParsedScript;
  open: boolean;
  favorites: Set<string>;
  onToggleFavorite: (scriptId?: string) => void;
  onCloseExplore: () => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
}

const ScriptModal = ({
  script,
  open,
  setOpen,
  refresh,
  favorites,
  onToggleFavorite,
  onCloseExplore,
}: ScriptModalProps) => {
  const { authenticated, me } = useContext(AuthContext);
  const { handleCreateThread } = useContext(ChatContext);
  const [expanded, setExpanded] = useState(false);

  const handleDelete = useCallback((script: ParsedScript) => {
    deleteScript(script)
      .then(() => refresh())
      .catch((error) => console.error(error))
      .finally(() => setOpen(false));
  }, []);

  return (
    <Modal
      id="script-modal"
      isOpen={open}
      scrollBehavior="inside"
      classNames={{
        base: expanded
          ? 'w-[95%] max-w-none h-[95%] max-h-none'
          : 'max-w-none w-[40%] h-4/6',
      }}
      onClose={() => {
        setOpen(false);
        setTimeout(() => setExpanded(false), 300);
      }}
    >
      <ModalContent>
        <ModalHeader className="block mt-8">
          <Button
            className="absolute top-1 right-8"
            size="sm"
            variant="light"
            isIconOnly
            radius="full"
            onClick={() => setExpanded(!expanded)}
            startContent={<LiaExpandArrowsAltSolid />}
          />
          <div className="mb-4 mt-4">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl truncate mb-2">
                {script.agentName ? script.agentName : script.displayName}
              </h1>
              <Tooltip content="Add to My Favorites">
                <Button
                  isIconOnly
                  className={`bg-white ${favorites.has(script.id?.toString() ?? '-1') ? 'text-yellow-500' : 'text-gray-500'}`}
                  onClick={() => onToggleFavorite(script.id?.toString())}
                >
                  {favorites.has(script.id?.toString() ?? '-1') ? (
                    <IoStarSharp size={32} />
                  ) : (
                    <CiStar size={32} />
                  )}
                </Button>
              </Tooltip>
            </div>
            <Tooltip
              color="primary"
              placement="right"
              content={
                <div className="flex flex-col gap-2">
                  <Table hideHeader removeWrapper>
                    <TableHeader>
                      <TableColumn> </TableColumn>
                      <TableColumn> </TableColumn>
                    </TableHeader>
                    <TableBody>
                      <TableRow key="1">
                        <TableCell className="font-bold">Author</TableCell>
                        <TableCell>{script.owner}</TableCell>
                      </TableRow>
                      <TableRow key="2">
                        <TableCell className="font-bold">Created at</TableCell>
                        <TableCell>
                          {new Date(script.createdAt || '').toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow key="3">
                        <TableCell className="font-bold">Updated at</TableCell>
                        <TableCell>
                          {new Date(script.updatedAt || '').toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow key="3">
                        <TableCell className="font-bold">URL</TableCell>
                        <TableCell>{script.publicURL}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              }
            >
              <div className="w-min">
                <p className="mx-1 text-primary cursor-default">
                  {script.owner}
                </p>
              </div>
            </Tooltip>
          </div>
          <div className="flex flex-wrap gap-2 w-full mt-4">
            {script.tags?.map((tag) => (
              <Chip size="sm" className="pb-0 mb-0" color="primary" key={tag}>
                {tag}
              </Chip>
            ))}
          </div>
          <Divider className="mt-4" />
        </ModalHeader>
        <ModalBody className="overflow-y-scroll flex-col">
          <div className="px-2">
            <p>
              {script.description
                ? script.description
                : 'No description provided'}
            </p>
          </div>
          <Accordion aria-label="details" fullWidth>
            <AccordionItem
              key="details"
              title="Details"
              startContent={<TbListDetails />}
            >
              <div className="h-full">
                <pre className="h-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white dark:border-zinc-800 border-1 text-xs whitespace-pre-wrap">
                  {script.content}
                </pre>
              </div>
            </AccordionItem>
          </Accordion>
        </ModalBody>
        <ModalFooter className="flex justify-between space-x-2">
          <Button
            color="primary"
            className="w-full"
            startContent={<LuMessageSquare />}
            onClick={() => {
              setOpen(false);
              onCloseExplore();
              // if we are in chat context, just do in place thread creation
              if (handleCreateThread) {
                handleCreateThread(script.publicURL!, script.id?.toString());
              } else {
                window.location.href = `/?file=${script.publicURL}&id=${script.id}`;
              }
            }}
          >
            Chat
          </Button>
          {authenticated && me?.username === script.owner && (
            <>
              <Button
                as={Link}
                href={`/edit?file=${script.publicURL}&id=${script.id}`}
                color="primary"
                className="w-full"
                startContent={<GoPencil />}
              >
                Edit
              </Button>
              <Button
                className="w-full"
                color="danger"
                variant="bordered"
                startContent={<GoTrash />}
                onPress={() => handleDelete(script)}
              >
                Delete
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ScriptModal;
