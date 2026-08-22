import { formattePrice } from "@/lib/utils";
import { ICartOption } from "@/src/store/features/CartSlice";

interface IProps {
  item: ICartOption[];
}

const Extra = ({ item }: IProps) => {
  if (!item.length) return null;

  return (
    <div className="space-y-0.5">
      
      {item.map((option) => (
        <div
          key={option.id}
          className="flex items-center justify-between text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-primary/50" aria-hidden />
            {option.name}
          </span>
          <span className="font-medium text-foreground/80">
            +{formattePrice(option.price)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Extra;
