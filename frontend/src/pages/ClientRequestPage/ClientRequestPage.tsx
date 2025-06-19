
import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
// import { useToast } from "@/hooks/use-toast"
import { MapPin, Building, User } from "lucide-react"
import { Link } from "react-router-dom"

export default function ClientRequestPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    buildingType: "",
    address: "",
    coordinates: { lat: 0, lng: 0 },
    additionalInfo: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt")
//   const { toast } = useToast()

  useEffect(() => {
    // Check geolocation permission
    if (navigator.geolocation) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationPermission(result.state)
      })
    }
  }, [])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }))
        //   toast({
        //     title: "Location captured",
        //     description: "Your current location has been recorded.",
        //   })
        },
        (error) => {
        //   toast({
        //     title: "Location error",
        //     description: "Unable to get your location. Please enter address manually.",
        //     variant: "destructive",
        //   })
        },
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/client/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Request submitted successfully!",
          description: "We'll review your request and contact you soon.",
        })
        setFormData({
          name: "",
          phone: "",
          email: "",
          buildingType: "",
          address: "",
          coordinates: { lat: 0, lng: 0 },
          additionalInfo: "",
        })
      } else {
        throw new Error("Failed to submit request")
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
              Fill out this form to request installation of our AI-powered fire detection system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
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
                  <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, buildingType: value }))}>
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
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter complete address"
                    required
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="flex items-center space-x-2"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Use Current Location</span>
                  </Button>
                  {formData.coordinates.lat !== 0 && (
                    <span className="text-sm text-green-600">
                      Location captured: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                    </span>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Any specific requirements or additional details..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Installation Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Status Check */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Check Request Status</CardTitle>
            <CardDescription>Already submitted a request? Check its status here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/client/status">
              <Button variant="outline" className="w-full">
                Check Status
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
