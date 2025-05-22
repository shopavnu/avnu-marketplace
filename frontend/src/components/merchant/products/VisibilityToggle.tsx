import { useState } from "react";
import { Switch } from "@headlessui/react";

interface VisibilityToggleProps {
  productId: string;
  initialState: boolean;
  onToggle: (productId: string, isVisible: boolean) => void;
}

const VisibilityToggle = ({
  productId,
  initialState,
  onToggle,
}: VisibilityToggleProps) => {
  const [isVisible, setIsVisible] = useState(initialState);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      // Toggle the state
      const newState = !isVisible;
      setIsVisible(newState);

      // Call the parent component's handler
      onToggle(productId, newState);
    } catch (error: unknown) {
      // Revert on error
      console.error("Error toggling product visibility:", error);
      setIsVisible(isVisible);

      // Show error notification (in a real app)
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Switch
      checked={isVisible}
      onChange={handleToggle}
      disabled={isUpdating}
      className={`${
        isVisible ? "bg-sage" : "bg-gray-200"
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 ${
        isUpdating ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <span className="sr-only">
        {isVisible ? "Product visible" : "Product hidden"}
      </span>
      <span
        className={`${
          isVisible ? "translate-x-6" : "translate-x-1"
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </Switch>
  );
};

export default VisibilityToggle;
