import { useEffect, useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
import { HiMinus } from "react-icons/hi";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { cn } from "../../../lib/utils";

// Define types for the props
interface AccordionProps {
  isEditing?: boolean;
  num: string | number;
  item: {
    question: string;
    answer: string;
  };
  className?: string;
  showFaqUpdateModal?: (item: { question: string; answer: string }) => void;
  showFaqDeleteModal?: (item: { question: string; answer: string }) => void;
}

const Accordion: React.FC<AccordionProps> = ({
  isEditing = false,
  num,
  item,
  className,
  showFaqUpdateModal,
  showFaqDeleteModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Calculate the height of the content when it opens or closes
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight); // Set to the content's height when open
    } else {
      setHeight(0); // Set to 0 when closed
    }
  }, [isOpen]);

  return (
    <div
      onClick={() => {
        if (!isEditing) toggleAccordion();
      }}
      className={cn(
        "mb-4 bg-surface duration-300 rounded-lg shadow-sm border border-border",
        className
      )}
    >
      <div className="flex items-start md:items-center px-4 py-4 cursor-pointer duration-300">
        {num && (
          <h1 className="text-primary text-lg md:text-xl font-bold mr-4 shrink-0">
            {num}
          </h1>
        )}
        <h3 className="text-foreground text-base md:text-lg font-semibold flex-1">
          {item?.question}
        </h3>
        <div className="flex gap-2 shrink-0 ml-4 items-center">
          {isEditing && (
            <>
              <div onClick={(e) => { e.stopPropagation(); showFaqUpdateModal?.(item); }} className="p-1 cursor-pointer">
                <FaEdit className="text-muted-foreground hover:text-primary text-base duration-300" />
              </div>
              <div onClick={(e) => { e.stopPropagation(); showFaqDeleteModal?.(item); }} className="p-1 cursor-pointer">
                <MdDelete className="text-muted-foreground hover:text-red-500 text-base duration-300" />
              </div>
            </>
          )}
          <div
            onClick={(e) => {
              if (isEditing) {
                e.stopPropagation();
                toggleAccordion();
              }
            }}
            className="p-1 rounded-full border border-border bg-muted/50 hover:bg-muted duration-300 flex items-center justify-center"
          >
            {isOpen ? (
              <HiMinus className="text-foreground text-lg" />
            ) : (
              <GoPlus className="text-foreground text-lg" />
            )}
          </div>
        </div>
      </div>
      <div
        ref={contentRef}
        style={{
          height: `${height}px`,
          overflow: "hidden",
          transition: "height 0.3s ease",
        }}
      >
        <div className="px-4 pb-4 pt-1 text-muted-foreground text-sm md:text-base leading-relaxed">
          {item?.answer}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
