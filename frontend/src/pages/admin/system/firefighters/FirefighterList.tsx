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
import { Loader2, Pencil, Trash2, Info, Users, MapPin, Phone } from "lucide-react";
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
    <div className="relative space-y-6">
      {/* Information Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Firefighters Management</p>
            <p>Manage all firefighters in the system. You can add new firefighters, edit their information, assign them to departments, and control their availability status.</p>
          </div>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <TableHead className="text-base font-semibold text-gray-700 py-4">Name</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Email</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Address</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Contact</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Status</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {firefighters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium text-gray-600 mb-1">No firefighters found</p>
                        <p className="text-sm text-gray-500">Add your first firefighter to get started</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                firefighters.map((item, index) => (
                  <TableRow 
                    key={item._id} 
                    className={`hover:bg-blue-50/50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <TableCell className="font-medium text-base text-gray-900 py-4">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 py-4">
                      {item.email}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700">{item.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{item.contact}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={
                          item.status === "busy"
                            ? "border-red-200 text-red-700 bg-red-50 font-medium"
                            : "border-green-200 text-green-700 bg-green-50 font-medium"
                        }
                      >
                        {item.status === "busy" ? "Busy" : "Available"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => editHandler(item._id)}
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedId(item._id);
                            setDeleteDialogOpen(true);
                          }}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

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
