import React, { useEffect, useState } from "react";
import { Flame, Users, Clock, CalendarDays, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import RecentAlertCard from "./components/RecentAlertCard";
import PendingRequestCard from "./components/PendingRequestCard";
import StatCard from "./components/StatCard";
import {
  loadActiveIncidents,
  loadPendingIncidents,
  respondToIncidentThunk,
  selectActiveIncidents,
  selectPendingIncidents,
} from "@/store/slices/incidentsSlice";
import { useDispatch, useSelector } from "react-redux";
import { store, type AppDispatch, type RootState } from "@/store/store";
import type { Incident } from "@/types";
import { fetchFirefightersByDepartment } from "@/store/slices/firefighterSlice";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const pendingRequests = useSelector(selectPendingIncidents);
  const activeIncidents = useSelector(selectActiveIncidents);
  const { firefighters } = useSelector(
    (state: RootState) => state.firefighters
  );
  const [rejectIncidentId, setRejectIncidentId] = useState<string | null>(null);
  const [rejectDeptId, setRejectDeptId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const storedUser = localStorage.getItem("userInfo");
  const storedDepartmentId = storedUser ? JSON.parse(storedUser)?._id : "";
  const storedUsername = storedUser ? JSON.parse(storedUser)?.username : "";

  console.log(storedDepartmentId);

  const [stats, setStats] = useState({
    activeIncidents: 0,
    pendingRequests: 0,
    availableFirefighters: 0,
    averageResponseTime: "5 min",
    incidentsToday: 0,
  });

  useEffect(() => {
  if (storedDepartmentId) {
    dispatch(loadActiveIncidents());
    dispatch(loadPendingIncidents(storedDepartmentId));
    dispatch(fetchFirefightersByDepartment(storedDepartmentId));
  }
}, [dispatch, storedDepartmentId]);


  useEffect(() => {
    const merged = [...pendingRequests, ...activeIncidents].slice(0, 5);
    setRecentIncidents(merged);

    const today = new Date().toDateString();
    const todayIncidents = merged.filter(
      (i) => new Date(i.timestamp).toDateString() === today
    );

    setStats((prev) => ({
      ...prev,
      availableFirefighters: firefighters.length,
      activeIncidents: activeIncidents.length,
      pendingRequests: pendingRequests.length,
      incidentsToday: todayIncidents.length,
    }));
  }, [pendingRequests, activeIncidents, firefighters]);

  useEffect(() => {
    const socket: Socket = io("http://localhost:8080");

    socket.on("NEW_INCIDENT_REQUEST", (incident: Incident) => {
      console.log(incident);

      if (incident.requested_department?._id === storedDepartmentId) {
        toast(
          `🚨 New ${incident.alert_type} at ${incident.location} (${(
            incident.confidence * 100
          ).toFixed(0)}%)`
        );
      }
      dispatch(loadPendingIncidents(storedDepartmentId));
    });

    socket.on("INCIDENT_ACCEPTED", (incident: Incident) => {
      toast.success(
        `Incident from ${incident.additional_info?.device_name} has been accepted by ${storedUsername}`
      );
      dispatch(loadPendingIncidents(storedDepartmentId));
      dispatch(loadActiveIncidents());
    });

    socket.on("INCIDENT_REASSIGNED", (incident: Incident) => {
      toast(`Incident reassigned `);
      dispatch(loadPendingIncidents(storedDepartmentId));
    });

    socket.on("INCIDENT_UNASSIGNED", () => {
      toast("Incident unassigned - manual intervention required");
      dispatch(loadPendingIncidents(storedDepartmentId));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, storedUsername, storedDepartmentId]);

  const handleAccept = (id: string, deptId: string) => {
    dispatch(
      respondToIncidentThunk({ id: id, departmentId: deptId, action: "accept" })
    );
  };

  const handleReject = (id: string, deptId: string) => {
    setRejectIncidentId(id);
    setRejectDeptId(deptId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5 p-3">
        {/* <h1 className="text-3xl font-bold text-gray-800">
          Fire Department Dashboard
        </h1> */}
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-3">
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={AlertTriangle}
          description="Awaiting your response"
          color="text-orange-500"
        />
        <StatCard
          title="Active Incidents"
          value={stats.activeIncidents}
          icon={Flame}
          description="Currently ongoing"
          color="text-red-500"
        />
        <StatCard
          title="Total Firefighters"
          value={stats.availableFirefighters}
          icon={Users}
          description="Ready for deployment"
          color="text-green-500"
        />
        <StatCard
          title="Avg. Response Time"
          value={stats.averageResponseTime}
          icon={Clock}
          description="Last 24 hours"
          color="text-blue-500"
        />
        <StatCard
          title="Incidents Today"
          value={stats.incidentsToday}
          icon={CalendarDays}
          description="Total reported today"
          color="text-purple-500"
        />
      </div>

      {pendingRequests.length > 0 && (
        <div className="bg-orange-50 p-6 border-2 border-orange-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-orange-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Pending Incident Requests ({pendingRequests.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((incident) => (
              <PendingRequestCard
                key={incident._id}
                incident={incident}
                onAccept={() =>
                  handleAccept(
                    incident._id.toString(),
                    storedDepartmentId.toString()
                  )
                }
                onReject={() =>
                  handleReject(
                    incident._id.toString(),
                    storedDepartmentId.toString()
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Recent Alerts</h2>
        </div>

        {recentIncidents.length > 0 ? (
          <div className="space-y-3">
            {recentIncidents.map((incident) => (
              <RecentAlertCard key={incident._id} incident={incident} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 h-full">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No recent alerts to display</p>
            <p className="text-sm text-gray-400">
              Real-time alerts will appear here
            </p>
          </div>
        )}
      </div>
      {rejectIncidentId && rejectDeptId && (
        <AlertDialog
          open={!!rejectIncidentId}
          onOpenChange={(open) => {
            if (!open) {
              setRejectIncidentId(null);
              setRejectionReason("");
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Incident</AlertDialogTitle>
              <AlertDialogDescription>
                Provide a reason for rejecting the incident:
              </AlertDialogDescription>
              <Input
                placeholder="Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    toast("Reason cannot be empty");
                    return;
                  }
                  dispatch(
                    respondToIncidentThunk({
                      id: rejectIncidentId,
                      departmentId: rejectDeptId,
                      action: "reject",
                      notes: rejectionReason,
                    })
                  );
                  toast.success("Incident rejected successfully");
                  setRejectIncidentId(null);
                  setRejectionReason("");
                }}
              >
                Confirm Reject
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Dashboard;
