"use client";

import { Button } from "@/components/ui/button";
import ClientList from "./ClientList";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Clients() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/system")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to System
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Client Requests Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage all client requests for fire safety services.
        </p>
      </div>

      <ClientList />
    </div>
  );
} 