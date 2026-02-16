"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

const FloatingChat = () => {
    return (
        <a
            href="https://wa.me/yourwhatsappnumber"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with us"
            className="fixed right-4 bottom-[10%] md:bottom-[15%] md:translate-y-[100px] w-12 h-12 bg-success-color/80 text-primary-foreground rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-110 transition-transform hover:bg-success-color"
        >
            <FaWhatsapp size={28} />
        </a>
    );
};

export default FloatingChat;
