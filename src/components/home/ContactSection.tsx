
"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import Container from "../ui/CustomUi/Container";
import { useT } from "@/components/i18n/DictionaryProvider";
import { getContactEmail } from "@/helpers/config/envConfig";

const ContactSection = () => {
    const t = useT();
    const contactEmail = getContactEmail();

    return (
        <section id="contact" className="py-16 md:py-24 bg-background text-foreground relative overflow-hidden">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Left Column */}
                    <div className="flex flex-col justify-between">
                        <div className="max-w-md">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-secondary">
                                {t.contact?.heading || "Let's Get in Touch."}
                            </h2>
                            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                                {t.contact?.subheading || "Whether you have a question or need assistance, we're here to help."}
                            </p>
                        </div>
                        
                        {/* Social Icons */}
                        <div className="flex items-center gap-4 mt-12 lg:mt-0">
                            {[FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn].map((Icon, i) => (
                                <a 
                                    key={i}
                                    href="#" 
                                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 mb-12">
                            {contactEmail && <div>
                                <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                                    {t.contact?.emailTitle || "EMAIL US"}
                                </h4>
                                <a className="text-sm font-medium hover:text-primary" href={`mailto:${contactEmail}`}>{contactEmail}</a>
                            </div>}
                            <div>
                                <h4 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
                                    {t.contact?.addressTitle || "ADDRESS"}
                                </h4>
                                <p className="text-sm font-medium whitespace-pre-line">{t.contact?.addressValue || "House 12, Road 5\nDhanmondi, Dhaka"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-border w-12"></div>
                            <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                                {t.contact?.getInTouch || "GET IN TOUCH"}
                            </span>
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-8 text-secondary">
                            {t.contact?.formHeading || "Send us a message"}
                        </h3>

                        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="text" 
                                placeholder={t.contact?.name || "Your name"} 
                                className="w-full bg-transparent border-b border-border py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                            <input 
                                type="email" 
                                placeholder={t.contact?.email || "name@yourname.com"} 
                                className="w-full bg-transparent border-b border-border py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                            <input 
                                type="tel" 
                                placeholder={t.contact?.phonePlaceholder || "+880 123 456 789"} 
                                className="w-full bg-transparent border-b border-border py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                            <textarea 
                                rows={3}
                                placeholder={t.contact?.message || "Enter your message here..."} 
                                className="w-full bg-transparent border-b border-border py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                            ></textarea>
                            
                            <button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-6 rounded-full transition-colors mt-4 w-max ml-auto flex items-center gap-2 text-sm">
                                {t.contact?.submit || "Submit Form"}
                                <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default ContactSection;

