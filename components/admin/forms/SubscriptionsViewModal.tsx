import React from "react";
import type { AdminSubscription } from "@/features/admin/subscriptions/adminSubscriptionsTypes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SubscriptionsModalProps {
  open: boolean;
  onClose: () => void;
  subscriptions: AdminSubscription[];
}

const SubscriptionsModal: React.FC<SubscriptionsModalProps> = ({
  open,
  onClose,
  subscriptions,
}) => {
  // Filter active subscriptions
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "ACTIVE"
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Active Subscriptions</DialogTitle>
        </DialogHeader>

        {activeSubscriptions.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            No active subscriptions
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSubscriptions.map((sub) => (
                <TableRow key={String(sub.id)}>
                  {/* Display plan title */}
                  <TableCell>{sub.plan?.title || "N/A"}</TableCell>

                  {/* Display plan price and currency */}
                  <TableCell>
                    {sub.plan
                      ? `${sub.plan.price} ${sub.plan.currency || ""}`
                      : "N/A"}
                  </TableCell>

                  {/* Format start date */}
                  <TableCell>
                    {sub.startDate ? formatDate(sub.startDate) : "N/A"}
                  </TableCell>

                  {/* Format end date */}
                  <TableCell>
                    {sub.endDate ? formatDate(sub.endDate) : "N/A"}
                  </TableCell>

                  {/* Status badge */}
                  <TableCell>
                    <Badge
                      variant={
                        sub.status === "ACTIVE"
                          ? "default"
                          : sub.status === "CANCELLED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Close button */}
        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionsModal;
