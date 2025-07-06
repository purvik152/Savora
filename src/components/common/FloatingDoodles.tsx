import { Leaf, UtensilsCrossed, Wheat, ChefHat, Soup, Cookie, Citrus, Carrot } from "lucide-react";
import { cn } from "@/lib/utils";

const Doodle = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("absolute text-primary/15 -z-10 hidden lg:block", className)}>
    {children}
  </div>
);

export function FloatingDoodles() {
  return (
    <>
      <Doodle className="top-[5%] left-[10%] animate-float-1">
        <Leaf className="w-16 h-16" />
      </Doodle>
      <Doodle className="top-[10%] right-[8%] animate-float-2">
        <UtensilsCrossed className="w-14 h-14" />
      </Doodle>
      <Doodle className="bottom-[15%] left-[15%] animate-float-3">
        <ChefHat className="w-20 h-20" />
      </Doodle>
      <Doodle className="bottom-[10%] right-[12%] animate-float-4">
        <Wheat className="w-12 h-12" />
      </Doodle>
      <Doodle className="top-[40%] right-[20%] animate-float-5">
        <Soup className="w-12 h-12" />
      </Doodle>
      <Doodle className="top-[60%] left-[5%] animate-float-6">
        <Cookie className="w-16 h-16" />
      </Doodle>
      <Doodle className="bottom-[30%] right-[5%] animate-float-7">
        <Citrus className="w-14 h-14" />
      </Doodle>
      <Doodle className="top-[80%] left-[22%] animate-float-8">
        <Carrot className="w-12 h-12" />
      </Doodle>
    </>
  );
}
