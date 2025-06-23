import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Building, User } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import API from "@/config/baseUrl";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientRequestSchema } from "@/validators/clientRequestValidators";
import type { Schema } from "@/validators/clientRequestValidators";
import {DotLoader} from "react-spinners"

interface FormData {
  name: string;
  phone: string;
  email: string;
  buildingType: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  additionalInfo?: string;
}

export default function ClientRequestPage() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<Schema>({
    resolver: zodResolver(clientRequestSchema),
    mode: "all",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      buildingType: "",
      address: "",
      location: { lat: 0, lng: 0 },
      additionalInfo: "",
    },
  });

  const [disable, setDisable] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");
  // const { toast } = useToast();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationPermission(result.state);
      });
    }
  }, []);

  const location = watch("location");

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("location", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setDisable(false);
          toast.success("Your location has been successfully captured.");
        },
        (error) => {
          toast.error(
            "Location permission denied. Enable it in your browser settings and try again."
          );
          setDisable(true);
        }
      );
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      console.log(data);
      const response = await API.post("/api/v1/client-request", data);

      console.log(response);
      toast.success("Submitted successfully");
      reset();
    } catch (error) {
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl mt-20">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-6 w-6" />
              <span>Fire Detection System Installation Request</span>
            </CardTitle>
            <CardDescription>
              Fill out this form to request installation of our AI-powered fire
              detection system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                      aria-invalid={errors.name ? "true" : "false"}
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register("phone", {
                        required: "Phone number is required",
                      })}
                      aria-invalid={errors.phone ? "true" : "false"}
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    })}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Building Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Building Information</span>
                </h3>

                <div>
                  <Label htmlFor="buildingType">Building Type *</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("buildingType", value, { shouldValidate: true })
                    }
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select building type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="office">Office Building</SelectItem>
                      <SelectItem value="retail">Retail Store</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.buildingType && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.buildingType.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Location Information</span>
                </h3>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    {...register("address", {
                      required: "Address is required",
                    })}
                    aria-invalid={errors.address ? "true" : "false"}
                    placeholder="Enter complete address"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4 flex-col md:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="flex items-center space-x-2"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Use Current Location (location of building)</span>
                  </Button>
                  {location.lat !== 0 ? (
                    <span className="text-sm text-green-600">
                      Location captured: {location.lat.toFixed(6)},{" "}
                      {location.lng.toFixed(6)}
                    </span>
                  ) : (
                    <span className="text-sm text-red-500">
                      * Location access needed.Please enable it in browser setting.
                    </span>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  {...register("additionalInfo")}
                  placeholder="Any specific requirements or additional details..."
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-400 hover:bg-orange-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <DotLoader size={15} color="#ffffff"/>
                ) : (
                  "Submit Installation Request"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
