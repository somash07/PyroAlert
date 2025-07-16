"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AddFirefighter from "./AddFirefighter";
import FirefighterList from "./FirefighterList";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Firefighters() {
  const [activeTab, setActiveTab] = useState("add");
  const [editClicked, setEditClicked] = useState(false);
  const [editData, setEditData] = useState<any>(null);
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
        <h1 className="text-2xl font-bold">Firefighters Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add, Edit and Manage firefighter personnel from any department.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setEditData(null);
          setEditClicked(false);
        }}
      >
        <TabsList className="mb-6 h-12 text-base">
          <TabsTrigger value="add" className="px-6">
            Add Firefighter
          </TabsTrigger>
          <TabsTrigger value="list" className="px-6">
            List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <AddFirefighter
            editClicked={editClicked}
            editData={editData}
            setEditData={setEditData}
            setEditClicked={setEditClicked}
            setActiveTab={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <FirefighterList
            setEditData={setEditData}
            setEditClicked={setEditClicked}
            setActiveTab={setActiveTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
