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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2, Info, Building2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Department {
  _id: string;
  username: string;
  email: string;
  location?: {
    lat: number;
    lng: number;
  };
  isVerified: boolean;
  type: string;
  createdAt: string;
}

interface Props {
  setEditClicked: (d: boolean) => void;
  setActiveTab: (d: string) => void;
  setEditData: (d: any) => void;
}

export default function DepartmentList({
  setEditClicked,
  setActiveTab,
  setEditData,
}: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [fetching, setFetching] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function editHandler(id: string) {
    try {
      const { data } = await API.get(
        `/api/v1/user/admin/departments/${id}`
      );
      setEditData(data.data);
      setEditClicked(true);
      setActiveTab("add");
    } catch (error) {
      toast.error("Error fetching department details");
    }
  }

  async function fetchAllDepartments() {
    setFetching(true);
    try {
      const { data } = await API.get(
        "/api/v1/user/admin/departments"
      );
      setDepartments(data.data);
    } catch (error) {
      console.error("Error fetching departments", error);
      toast.error("Error fetching departments");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchAllDepartments();
  }, []);

  const confirmDelete = async () => {
    if (!selectedId) return;

    setDeleteLoading(true);
    try {
      await API.delete(`/api/v1/user/admin/departments/${selectedId}`);
      toast.success("Department deleted successfully");
      fetchAllDepartments();
      setDeleteDialogOpen(false);
      setSelectedId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error deleting department");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="relative space-y-6">
      {/* Information Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Building2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Departments Management</p>
            <p>Manage all fire departments in the system. You can add new departments, edit existing ones, and control their active status. Each department can have multiple firefighters assigned to it.</p>
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
              <TableRow className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <TableHead className="text-base font-semibold text-gray-700 py-4">Department Name</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Email</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Location</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Status</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Created</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium text-gray-600 mb-1">No departments found</p>
                        <p className="text-sm text-gray-500">Add your first department to get started</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((item, index) => (
                  <TableRow 
                    key={item._id} 
                    className={`hover:bg-purple-50/50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <TableCell className="font-medium text-base text-gray-900 py-4">
                      {item.username}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 py-4">
                      {item.email}
                    </TableCell>
                    <TableCell className="py-4">
                      {item.location ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                            <MapPin className="h-3 w-3 text-purple-600" />
                          </div>
                          <span className="text-sm text-gray-700">
                            {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={
                          item.isVerified
                            ? "border-green-200 text-green-700 bg-green-50 font-medium"
                            : "border-red-200 text-red-700 bg-red-50 font-medium"
                        }
                      >
                        {item.isVerified ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
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
                <DialogTitle>Delete Department?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this department? This action
                cannot be undone.
              </p>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
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