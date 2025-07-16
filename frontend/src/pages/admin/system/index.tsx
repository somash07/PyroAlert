import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Building,
  ClipboardList,
  Package,
  AlertTriangle,
} from "lucide-react";

const SYSTEM_SECTIONS = [
  {
    title: "Firefighters",
    description: "Manage firefighter profiles, training, and assignments.",
    icon: Users,
    path: "/admin/firefighters",
  },
  {
    title: "Departments",
    description: "Configure fire departments and their jurisdictions.",
    icon: Building,
    path: "/admin/departments",
  },
  {
    title: "Clients",
    description: "Manage clients who receive fire safety services.",
    icon: ClipboardList,
    path: "/admin/clients",
  },
  {
    title: "Incident Reports",
    description: "Review and manage reports of fire incidents.",
    icon: AlertTriangle,
    path: "/admin/incidents",
  },
  {
    title: "Equipment Inventory",
    description: "Track and maintain firefighting equipment and supplies.",
    icon: Package,
    path: "/admin/equipment",
  },
];

const System: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">System</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:gap-3">
        {SYSTEM_SECTIONS.map(({ title, description, icon: Icon, path }) => (
          <Card
            key={title}
            className="flex flex-col justify-between h-full shadow-none border border-gray-200"
          >
            <CardHeader className="flex flex-row items-start gap-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-muted">
                <Icon className="text-primary" size={20} />
              </div>
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="">
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => navigate(path)}
              >
                Manage {title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default System;
