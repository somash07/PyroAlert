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
import { Loader2, Info, Users, MapPin, Phone, Mail, Building } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  buildingType: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  additionalInfo?: string;
  applicationStatus: "inactive" | "active";
  createdAt: string;
}

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [fetching, setFetching] = useState(false);

  async function fetchAllClients() {
    setFetching(true);
    try {
      const { data } = await API.get("/api/v1/user/admin/clients");
      setClients(data.data);
    } catch (error) {
      console.error("Error fetching clients", error);
      toast.error("Error fetching clients");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchAllClients();
  }, []);

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  return (
    <div className="relative space-y-6">
      {/* Information Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Client Requests Management</p>
            <p>View all client requests for fire safety services. You can see client details, contact information, and request status. Click on email or phone to contact clients directly.</p>
          </div>
        </div>
      </div>

      {fetching ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-gray-200">
                <TableHead className="text-base font-semibold text-gray-700 py-4">Client Name</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Contact</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Building Type</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Address</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Status</TableHead>
                <TableHead className="text-base font-semibold text-gray-700 py-4">Requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium text-gray-600 mb-1">No client requests found</p>
                        <p className="text-sm text-gray-500">Client requests will appear here when submitted</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((item, index) => (
                  <TableRow 
                    key={item._id} 
                    className={`hover:bg-orange-50/50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <TableCell className="font-medium text-base text-gray-900 py-4">
                      {item.name}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors group"
                          onClick={() => handleEmailClick(item.email)}
                        >
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <Mail className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-700">{item.email}</span>
                        </div>
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:text-green-600 transition-colors group"
                          onClick={() => handlePhoneClick(item.phone)}
                        >
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <Phone className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700">{item.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <Building className="h-3 w-3 text-orange-600" />
                        </div>
                        <span className="text-sm text-gray-700">{item.buildingType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                          <MapPin className="h-3 w-3 text-yellow-600" />
                        </div>
                        <span className="text-sm text-gray-700">{item.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={
                          item.applicationStatus === "active"
                            ? "border-green-200 text-green-700 bg-green-50 font-medium"
                            : "border-gray-200 text-gray-700 bg-gray-50 font-medium"
                        }
                      >
                        {item.applicationStatus === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 