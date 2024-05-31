"use client"

import React, { useState } from "react";
import { IoMdSend } from "react-icons/io";
import { FaBackward } from "react-icons/fa";
import {
	Button,
    Textarea,
} from "@nextui-org/react";

const ChatBar = ({
    onBack,
    noChat,
    onMessageSent,
    backButton,
}: {
    onBack: () => void;
    onMessageSent: (message: string) => void;
    backButton: boolean;
    noChat?: boolean;
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        onMessageSent(inputValue);
        setInputValue(''); // Clear the input field after sending the message
    };

    if (noChat) {
        if (backButton) return (
            <Button
                startContent={<FaBackward />}
                className="mr-2 my-auto text-lg w-full"
                onPress={onBack}
            >
                Change options
            </Button>
        );
        return null;
    }

    return (
        <div className="flex p-4 w-full">
            {backButton && <Button
                startContent={<FaBackward />}
                isIconOnly
                radius="full"
                className="mr-2 my-auto text-lg"
                onPress={onBack}
            />}
            <Textarea
                id="chatInput"
                autoComplete="off"
                placeholder="Ask the chat bot something..."
                value={inputValue}
                radius="full"
                minRows={1}
                variant="bordered"
                color="primary"
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                    }
                }}
            />
            <Button
                startContent={<IoMdSend />}
                isIconOnly
                radius="full"
                className="ml-2 my-auto text-lg"
                color="primary"
                onPress={handleSend}
            />
        </div>
    );
};

export default ChatBar