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
import { Loader2 } from "lucide-react";

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
    <Card className="shadow-none border border-gray-200 px-5 py-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-6 max-w-"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 text-base"
                      placeholder="Full Name"
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
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="h-12 text-base"
                      placeholder="Email"
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
                  <FormLabel className="text-base">Contact</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 text-base"
                      placeholder="Phone Number"
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
                      className="h-12 text-base"
                      placeholder="Address"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
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

          <FormItem className="w-1/2">
            <FormLabel className="text-base">Department</FormLabel>
            <Select onValueChange={setSelectedDept} value={selectedDept ?? ""}>
              <FormControl>
                <SelectTrigger className="h-12 text-base w-full">
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

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center w-1/2 justify-between rounded-lg border p-4 shadow-none">
                <FormLabel className="text-base">Active</FormLabel>
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

          <Button type="submit" size="lg">
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
