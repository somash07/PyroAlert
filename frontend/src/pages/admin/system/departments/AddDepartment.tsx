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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import API from "@/config/baseUrl";
import { toast } from "sonner";
import { Loader2, Info, MapPin } from "lucide-react";

const formSchema = z.object({
  id: z.string().nullable(),
  username: z.string().min(1, "Department name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  isActive: z.boolean(),
});

interface Props {
  editClicked: boolean;
  editData: any;
  setEditData: (d: any) => void;
  setEditClicked: (d: boolean) => void;
  setActiveTab: (d: string) => void;
}

export default function AddDepartment({
  editClicked,
  editData,
  setEditData,
  setEditClicked,
  setActiveTab,
}: Props) {
  const [addLoading, setAddLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: null,
      username: "",
      email: "",
      password: "",
      lat: "",
      lng: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (editClicked && editData) {
      form.reset({
        id: editData._id ?? "",
        username: editData.username ?? "",
        email: editData.email ?? "",
        password: "", // Don't populate password for security
        lat: editData.location?.lat?.toString() ?? "",
        lng: editData.location?.lng?.toString() ?? "",
        isActive: editData.isVerified ?? true,
      });
    }
  }, [editClicked, editData, form]);

  const onSubmit = async (values: any) => {
    // Validate password for new departments
    if (!editClicked && (!values.password || values.password.trim() === "")) {
      toast.error("Password is required for new departments");
      return;
    }

    const request = {
      ...values,
      id: values.id ?? "",
      password: values.password || undefined, // Only send password if provided
      location: values.lat && values.lng ? {
        lat: parseFloat(values.lat),
        lng: parseFloat(values.lng)
      } : undefined,
    };
    
    setAddLoading(true);
    try {
      const { data } = await API.post(
        "/api/v1/user/admin/departments",
        request
      );
      toast.success(editClicked ? "Department updated successfully" : "Department added successfully");
      setActiveTab("list");
      setEditData(null);
      setEditClicked(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
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
          {/* General Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">General Information</h3>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Department Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-12 text-base border-gray-300"
                        placeholder="Enter department name"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      {editClicked ? "New Password" : "Password"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="h-12 text-base border-gray-300"
                        placeholder={editClicked ? "Leave blank to keep current" : "Enter password"}
                        {...field}
                      />
                    </FormControl>
                    {editClicked && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Leave blank to keep the current password
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Location</h3>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Location Information</p>
                  <p>Please provide the exact coordinates of your fire department location. You can find these coordinates using Google Maps or any GPS application.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        className="h-12 text-base border-gray-300"
                        placeholder="e.g., 40.7128"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        className="h-12 text-base border-gray-300"
                        placeholder="e.g., -74.0060"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-gray-300 p-4">
                  <div>
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enable this to make the department active in the system
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

          <Button type="submit" size="lg" className="w-full md:w-auto">
            {addLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white mr-1.5" />
            ) : null}
            {editClicked ? "Update Department" : "Add Department"}
          </Button>
        </form>
      </Form>
    </Card>
  );
} 