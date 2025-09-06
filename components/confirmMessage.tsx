import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  trigger?: ReactNode;
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
}: ConfirmDialogProps) {
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              {cancelText}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
