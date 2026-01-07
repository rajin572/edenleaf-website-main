import { cn } from '@/lib/utils';


interface PageWraperProps {
    className?: string;
    title: string;
    children: React.ReactNode;
}

const PageWraper: React.FC<PageWraperProps> = ({ className, title, children }) => {
    return (
        <section className={cn("space-y-5 min-h-screen p-10", className)}>
            <div>
                <h1 className='text-2xl lg:text-3xl font-bold text-foreground'>{title}</h1>
            </div>
            {children}
        </section>
    );
};

export default PageWraper;