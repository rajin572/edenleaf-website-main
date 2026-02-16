import Image from 'next/image';
import { ShieldCheck, HeartHandshake, Leaf, Award } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row gap-10 items-center mb-20">
                <div className="md:w-1/2">
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">About Ednleaf</h1>
                    <p className="text-lg text-text-secondary leading-relaxed mb-6">
                        Ednleaf is your trusted destination for 100% pure, natural, and healthy food products in Bangladesh.
                        We believe that good food is the foundation of a healthy life, and our mission is to bring the authentic taste
                        of rural Bangladesh right to your doorstep.
                    </p>
                    <p className="text-lg text-text-secondary leading-relaxed">
                        From the dense forests of Sundarbans to the traditional village fields, we source our products directly
                        from farmers and producers, ensuring zero adulteration and premium quality.
                    </p>
                </div>
                <div className="md:w-1/2 relative h-[300px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-xl">
                    <Image src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" alt="Our Story" fill className="object-cover" />
                </div>
            </div>

            {/* Values Section */}
            <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 mb-20">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
                    <p className="text-text-secondary max-w-2xl mx-auto">We are committed to maintaining the highest standards in every product we deliver.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Leaf size={32} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">100% Natural</h3>
                        <p className="text-sm text-text-secondary">No artificial colors, flavors, or preservatives.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Premium Quality</h3>
                        <p className="text-sm text-text-secondary">Strict quality control from sourcing to packaging.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <HeartHandshake size={32} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Fair Trade</h3>
                        <p className="text-sm text-text-secondary">Directly supporting local farmers and producers.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award size={32} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Customer Trust</h3>
                        <p className="text-sm text-text-secondary">Your health and satisfaction are our top priorities.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
