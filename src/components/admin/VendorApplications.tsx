import React, { useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/hooks/useAdminData";

// Add debugging for data fetching and state updates
export const VendorApplications: React.FC = () => {
    const { applications, refresh: refetchVendorApplications } = useAdminData();
    const [loadingStates, setLoadingStates] = useState<{
        [key: string]: boolean;
    }>({});
    const { toast } = useToast();
    const [selectedApp, setSelectedApp] = useState<UserProfile | null>(null);
    const [appDraft, setAppDraft] = useState<UserProfile | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Add debug logging for application data
    React.useEffect(() => {
        console.log("Current applications:", applications);
        console.log("Filtered applications:", filteredApplications);
    }, [applications]);

    // Enhanced handleOpenModal with debugging
    const handleOpenModal = (app: UserProfile) => {
        console.log("Opening modal for application:", app);
        setSelectedApp(app);
        setAppDraft({ ...app });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedApp(null);
        setAppDraft(null);
    };

    const handleDraftChange = (field: string, value: string) => {
        setAppDraft((prev) => ({ ...prev, [field]: value }));
    };

    // Enhanced handleAccept with detailed error logging
    const handleAccept = async () => {
        if (!appDraft?.user_id) {
            console.error("No user_id found in appDraft:", appDraft);
            return;
        }

        console.log("Starting approval process for:", {
            userId: appDraft.user_id,
            role: appDraft.role,
            currentStatus: appDraft.application_status
        });

        setLoadingStates((prev) => ({ ...prev, [appDraft.user_id]: true }));

        try {
            console.log("Updating user_profiles...");
            // Update application status in user_profiles
            const { data: profileData, error: updateError } = await supabase
                .from("user_profiles")
                .update({
                    application_status: "approved",
                    business_name: appDraft.business_name,
                    full_name: appDraft.full_name,
                    whatsapp_number: appDraft.whatsapp_number,
                    location: appDraft.location,
                    google_maps_url: appDraft.google_maps_url,
                })
                .eq("user_id", appDraft.user_id)
                .select();

            if (updateError) {
                console.error("Profile update failed:", {
                    error: updateError,
                    context: appDraft
                });
                throw updateError;
            }
            console.log("Profile update successful:", profileData);

            console.log("Updating user_roles...");
            // Update user role
            const { data: roleData, error: roleUpdateError } = await supabase
                .from("user_roles")
                .update({
                    is_approved: true,
                })
                .eq("user_id", appDraft.user_id)
                .select();

            if (roleUpdateError) {
                console.error("Role update failed:", {
                    error: roleUpdateError,
                    context: appDraft
                });
                throw roleUpdateError;
            }
            console.log("Role update successful:", roleData);

            console.log("Refetching vendor applications...");
            await refetchVendorApplications();
            
            console.log("Approval process completed successfully");
            handleCloseModal();

            toast({
                title: "Application approved",
                description: "Vendor application has been approved successfully.",
            });
        } catch (error) {
            console.error("Approval process failed:", {
                error,
                appDraft,
                context: {
                    userId: appDraft.user_id,
                    role: appDraft.role,
                    status: appDraft.application_status
                }
            });
            
            toast({
                title: "Error",
                description: `Failed to approve the application: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setLoadingStates((prev) => ({
                ...prev,
                [appDraft.user_id]: false,
            }));
            console.log("Loading state cleared for user:", appDraft.user_id);
        }
    };

    const filteredApplications = applications.filter(
  (app) => 
    app.application_status !== "not_applied" && 
    (app.role === "vendor" || app.role === "buyer") // Explicitly allow only these
);

    // Add debug logging for loading states
    React.useEffect(() => {
        console.log("Current loading states:", loadingStates);
    }, [loadingStates]);

    // Add debug logging for modal state
    React.useEffect(() => {
        console.log("Modal state:", {
            isOpen: modalOpen,
            selectedApp,
            appDraft
        });
    }, [modalOpen, selectedApp, appDraft]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">User Applications</h1>
                <p className="text-gray-500">
                    Review and manage both buyer and vendor applications.
                </p>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Business Name</TableHead>
                            <TableHead>Applicant Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredApplications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell>
                                    <Badge
                                        variant={app.role === "vendor" ? "default" : "secondary"}
                                        className={app.role === "vendor" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                                    >
                                        {app.role === "vendor" ? "Vendor" : "Buyer"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{app.business_name || "N/A"}</TableCell>
                                <TableCell>{app.full_name}</TableCell>
                                <TableCell>{app.whatsapp_number}</TableCell>
                                <TableCell>{app.location}</TableCell>
                                <TableCell>
                                    {format(
                                        new Date(app.application_submitted_at),
                                        "PPP"
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            app.application_status ===
                                            "approved"
                                                ? "default"
                                                : "secondary"
                                        }>
                                        {app.application_status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {app.application_status !== "approved" && (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleOpenModal(app)
                                            }>
                                            View
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {appDraft?.role === "vendor" ? "Vendor" : "Buyer"} Application Details
                        </DialogTitle>
                        <DialogDescription>
                            Review {appDraft?.role === "vendor" ? "vendor" : "buyer"} application details
                        </DialogDescription>
                    </DialogHeader>

                    {appDraft && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 gap-4">
                                {/* Application Type */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-muted-foreground">
                                        Application Type
                                    </Label>
                                    <div className="px-3 py-2 rounded-md bg-muted">
                                        <Badge
                                            variant={appDraft.role === "vendor" ? "default" : "secondary"}
                                            className={appDraft.role === "vendor" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                                        >
                                            {appDraft.role === "vendor" ? "Vendor" : "Buyer"}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-muted-foreground">
                                        Email
                                    </Label>
                                    <div className="px-3 py-2 rounded-md bg-muted">
                                        {appDraft.email || "N/A"}
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-muted-foreground">
                                        Full Name
                                    </Label>
                                    <div className="px-3 py-2 rounded-md bg-muted">
                                        {appDraft.full_name || "N/A"}
                                    </div>
                                </div>

                                {/* Business Name */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-muted-foreground">
                                        Business Name
                                    </Label>
                                    <div className="px-3 py-2 rounded-md bg-muted">
                                        {appDraft.business_name || "N/A"}
                                    </div>
                                </div>

                                {/* WhatsApp Number */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-muted-foreground">
                                        WhatsApp Number
                                    </Label>
                                    <div className="px-3 py-2 rounded-md bg-muted">
                                        {appDraft.whatsapp_number || "N/A"}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-muted-foreground">
                                        Location
                                    </Label>
                                    <div className="px-3 py-2 rounded-md bg-muted">
                                        {appDraft.location || "N/A"}
                                    </div>
                                </div>

                                {/* Google Maps URL */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm text-muted-foreground">
                                        Google Maps URL
                                    </Label>
                                    <div className="px-3 py-2 rounded-md bg-muted">
                                        {appDraft.google_maps_url ? (
                                            <a
                                                href={appDraft.google_maps_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline break-all">
                                                {appDraft.google_maps_url}
                                            </a>
                                        ) : (
                                            "N/A"
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="border-t pt-4">
                        <Button
                            onClick={handleAccept}
                            disabled={loadingStates[appDraft?.user_id]}
                            className={appDraft?.role === "vendor" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}
                        >
                            {loadingStates[appDraft?.user_id]
                                ? "Processing..."
                                : `Accept ${appDraft?.role === "vendor" ? "Vendor" : "Buyer"} Application`}
                        </Button>
                        <Button variant="outline" onClick={handleCloseModal}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
