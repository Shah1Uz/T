import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  className?: string;
  iconClassName?: string;
}

export default function VerifiedBadge({ className = "", iconClassName = "w-4 h-4" }: VerifiedBadgeProps) {
  return (
    <div 
      className={"inline-flex items-center justify-center text-blue-500 bg-white rounded-full " + className}
      title="Tasdiqlangan foydalanuvchi"
    >
      <BadgeCheck className={iconClassName + " fill-blue-500 text-white"} />
    </div>
  );
}
