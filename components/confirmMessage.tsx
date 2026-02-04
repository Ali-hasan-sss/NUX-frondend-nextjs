import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  trigger?: ReactNode;
  /** "default" for primary action (e.g. add), "destructive" for delete */
  confirmVariant?: "default" | "destructive";
  /** When true, confirm button shows spinner and is disabled */
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  setOpen,
  title = "confirm action",
  message,
  confirmText = "Ok",
  cancelText = "Cancel",
  onConfirm,
  trigger,
  confirmVariant = "destructive",
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    try {
      await Promise.resolve(onConfirm());
      setOpen(false);
    } catch (_) {
      // Leave dialog open on error
    }
  };

  return (
    <>
      {trigger && <span onClick={() => setOpen(true)}>{trigger}</span>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">{message}</p>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {cancelText}
            </Button>
            <Button
              variant={confirmVariant}
              className={
                confirmVariant === "destructive"
                  ? "hover:text-destructive"
                  : undefined
              }
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {confirmText}
                </>
              ) : (
                confirmText
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
