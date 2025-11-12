import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  BarChart3,
  Settings,
  DollarSign,
  ArrowRight,
  Megaphone,
  Clock,
} from "lucide-react";
import { Link } from "wouter";

export default function DashboardPage() {
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-xl">FAKE PLACEHOLDER DATA</h1>

        {/* Big Go To Shipping Button */}
        <Link href="/ship">
          <Button
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 text-lg px-6 py-4 flex items-center gap-2 shadow-md"
          >
            Go to Shipping <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Shipments</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">248</p>
            <p className="text-xs text-gray-500">in the past 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Labels Printed</CardTitle>
            <BarChart3 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,472</p>
            <p className="text-xs text-gray-500">total since last sync</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Savings</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">$3,426</p>
            <p className="text-xs text-gray-500">in carrier discounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>System Status</CardTitle>
            <Settings className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Online</p>
            <p className="text-xs text-gray-500">all services operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements + Recent Activity Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Announcements */}
        <Card className="h-full">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <CardTitle>Announcements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-gray-600 text-sm space-y-3">
            <div className="border-b pb-2">
              <p className="font-medium text-gray-800">📦 UPS BYOA rollout coming soon</p>
              <p className="text-xs text-gray-500">Expected launch: Nov 20th</p>
            </div>

            <div className="border-b pb-2">
              <p className="font-medium text-gray-800">💰 Improved Savings Dashboard</p>
              <p className="text-xs text-gray-500">Historical savings graphs coming soon</p>
            </div>

            <div>
              <p className="font-medium text-gray-800">⚙️ Scheduled Maintenance</p>
              <p className="text-xs text-gray-500">Nov 15th, 2–3 AM ET</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="h-full">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-gray-600 text-sm space-y-3">
            <div className="border-b pb-2">
              <p className="font-medium text-gray-800">Label #49218 printed</p>
              <p className="text-xs text-gray-500">3 minutes ago</p>
            </div>

            <div className="border-b pb-2">
              <p className="font-medium text-gray-800">Shipment #1832 created</p>
              <p className="text-xs text-gray-500">15 minutes ago</p>
            </div>

            <div>
              <p className="font-medium text-gray-800">Rate cache refreshed</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
