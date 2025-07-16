"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import API from "@/config/baseUrl";
import { toast } from "sonner";
import { Loader2, Info, User, Phone, MapPin, Building2 } from "lucide-react";

const formSchema = z.object({
  id: z.string().nullable(),
  name: z.string().min(1),
  email: z.string().email(),
  contact: z.string().min(8),
  address: z.string().min(1),
  status: z.enum(["busy", "available"]),
  isActive: z.boolean(),
});

interface Props {
  editClicked: boolean;
  editData: any;
  setEditData: (d: any) => void;
  setEditClicked: (d: boolean) => void;
  setActiveTab: (d: string) => void;
}
export default function AddFirefighter({
  editClicked,
  editData,
  setEditData,
  setEditClicked,
  setActiveTab,
}: Props) {
  const [addLoading, setAddLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [depts, setDepts] = useState<any>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: null,
      name: "",
      email: "",
      contact: "",
      address: "",
      status: "available",
      isActive: true,
    },
  });

  async function fetchDepts() {
    try {
      const { data } = await API.get("/api/v1/user/admin/users");
      setDepts(data.data);
    } catch (error) {}
  }

  useEffect(() => {
    fetchDepts();
  }, []);

  useEffect(() => {
    if (!editClicked && depts.length > 0) {
      setSelectedDept(depts[0].id);
    }
  }, [editClicked, depts]);

  useEffect(() => {
    if (editClicked && editData) {
      form.reset({
        id: editData._id ?? "",
        name: editData.name ?? "",
        email: editData.email ?? "",
        contact: editData.contact ?? "",
        isActive:
          typeof editData.isActive === "boolean" ? editData.isActive : true,
        status: editData.status ?? "available",
        address: editData.address ?? "",
      });
      setSelectedDept(editData.departmentId ?? depts[0]?.id ?? "");
    }
  }, [editClicked, editData, depts, form]);

  const onSubmit = async (values: any) => {
    console.log("clickedddd", values);
    const request = {
      ...values,
      id: values.id ?? "",
      departmentId: selectedDept,
    };
    setAddLoading(true);
    try {
      const { data } = await API.post(
        "/api/v1/firefighters/addFirefighterAdmin",
        request
      );
      setActiveTab("list");
      setEditData(null);
      setEditClicked(false);
      form.reset();
    } catch (error) {
      toast.error("Something went wrong here.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <Card className="shadow-none border border-gray-300 px-6 py-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-12 text-base border-gray-300"
                        placeholder="Enter full name"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className="h-12 text-base border-gray-300"
                        placeholder="Enter email address"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Contact Number</FormLabel>
                    <FormControl>
                      <Input
                        className="h-12 text-base border-gray-300"
                        placeholder="Enter phone number"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Address</FormLabel>
                    <FormControl>
                      <Input
                        className="h-12 text-base border-gray-300"
                        placeholder="Enter address"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Assignment Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Assignment</h3>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Department Assignment</p>
                  <p>Assign this firefighter to a specific department. The department will be responsible for managing this firefighter's assignments and status.</p>
                </div>
              </div>
            </div>
            <FormItem className="w-full md:w-1/2">
              <FormLabel className="text-base">Department</FormLabel>
              <Select onValueChange={setSelectedDept} value={selectedDept ?? ""}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base w-full border-gray-300">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {depts.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.username
                        .split(" ")
                        .map(
                          (i: string) => i.charAt(0).toUpperCase() + i.slice(1)
                        )
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status & Availability</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Current Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base border-gray-300">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-gray-300 p-4">
                    <div>
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enable this to make the firefighter active in the system
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-500 transition-colors"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full md:w-auto">
            {addLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white mr-1.5" />
            ) : null}
            {editClicked ? "Update Firefighter" : "Add Firefighter"}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
