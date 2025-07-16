"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import API from "@/config/baseUrl";
import { deleteFirefighter } from "@/store/slices/firefighterSlice";
import type { AppDispatch } from "@/store/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

interface Firefighter {
  _id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  status: "busy" | "available";
  isActive: boolean;
}

interface Props {
  setEditClicked: (d: boolean) => void;
  setActiveTab: (d: string) => void;
  setEditData: (d: any) => void;
}
export default function FirefighterList({
  setEditClicked,
  setActiveTab,
  setEditData,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const [firefighters, setFirefighters] = useState<Firefighter[]>([]);
  const [fetching, setFetching] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function editHandler(id: string) {
    const { data } = await API.get(
      `/api/v1/firefighters/getSingleFirefighterAdmin/${id}`
    );
    setEditData(data.data);
    setEditClicked(true);
    setActiveTab("add");
  }

  async function fetchAllFirefighters() {
    setFetching(true);
    try {
      const { data } = await API.get(
        "/api/v1/firefighters/getAllFirefightersAdmin"
      );
      setFirefighters(data.data);
    } catch (error) {
      console.error("Error fetching firefighters", error);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchAllFirefighters();
  }, []);

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      await dispatch(deleteFirefighter(selectedId));
      fetchAllFirefighters();
      setDeleteDialogOpen(false);
      setSelectedId(null);
    } catch (error) {
      toast.error("Error deleting firefighter");
    }
  };

  return (
    <div className="relative">
      {fetching ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">Name</TableHead>
                <TableHead className="text-base">Email</TableHead>
                <TableHead className="text-base">Address</TableHead>
                <TableHead className="text-base">Contact</TableHead>
                <TableHead className="text-base">Status</TableHead>
                <TableHead className="text-base">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {firefighters.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium text-base">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.email}
                  </TableCell>
                  <TableCell>{item.address}</TableCell>
                  <TableCell>{item.contact}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.status === "busy"
                          ? "border-red-500 text-red-500"
                          : "border-green-500 text-green-500"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Pencil
                        className="w-4 h-4 cursor-pointer text-muted-foreground"
                        onClick={() => editHandler(item._id)}
                      />
                      <Trash2
                        onClick={() => {
                          setSelectedId(item._id);
                          setDeleteDialogOpen(true);
                        }}
                        className="w-4 h-4 cursor-pointer text-red-500"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Firefighter?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this firefighter? This action
                cannot be undone.
              </p>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Yes, Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
