import { useState, useMemo } from "react";
import { useAllAttendanceReports, useDashboardMetrics, useCreateAttendanceReport, useUpdateAttendanceReport } from '@/hooks/useAttendanceReports';
import { AttendanceReportInsert } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Zap, MapPin, Home, Building, Baby, TrendingUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, ListFilter, Calendar, FilePlus2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LocationSelect } from "@/components/ui/location-select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("5");
  const [tierFilter, setTierFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDatePickerOpen, setIsAddDatePickerOpen] = useState(false);
  const [isEditDatePickerOpen, setIsEditDatePickerOpen] = useState(false);
  const [selectedReportIndex, setSelectedReportIndex] = useState<number | null>(null);
  const [newReport, setNewReport] = useState({
    date: new Date().toISOString().split('T')[0],
    location_id: "",
    sv1: 0,
    sv2: 0,
    yxp: 0,
    kids: 0,
    local: 0,
    hc1: 0,
    hc2: 0
  });
  const [editReport, setEditReport] = useState({
    date: new Date().toISOString().split('T')[0],
    location_id: "",
    sv1: 0,
    sv2: 0,
    yxp: 0,
    kids: 0,
    local: 0,
    hc1: 0,
    hc2: 0
  });

  // Fetch all attendance reports (no pagination - handled client-side)
  const {
    data: allReports,
    isLoading: isLoadingReports,
    error: reportsError,
  } = useAllAttendanceReports({
    dateFilter,
    customDateRange: dateFilter === 'custom-range' ? customDateRange : undefined,
    tierFilter,
  });

  const {
    data: dashboardMetrics,
    isLoading: isLoadingMetrics,
  } = useDashboardMetrics({
    dateFilter,
    customDateRange: dateFilter === 'custom-range' ? customDateRange : undefined,
  });

  const createReportMutation = useCreateAttendanceReport();
  const updateReportMutation = useUpdateAttendanceReport();

  // Client-side pagination and filtering
  const paginatedData = useMemo(() => {
    const reports = allReports || [];
    const pageSize = parseInt(rowsPerPage);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      reports: reports.slice(startIndex, endIndex),
      totalCount: reports.length,
      totalPages: Math.ceil(reports.length / pageSize),
      startIndex,
      endIndex: Math.min(endIndex, reports.length),
    };
  }, [allReports, currentPage, rowsPerPage]);

  const { reports: currentData, totalCount: totalRows, totalPages, startIndex, endIndex } = paginatedData;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleTierFilterChange = (value: string) => {
    setTierFilter(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
    setIsDateDropdownOpen(false); // Close dropdown when selecting any date filter option
    // Only clear custom date range if switching away from custom-range to another filter
    // This preserves the selection when user switches back to custom-range
    if (value !== "custom-range" && dateFilter === "custom-range") {
      // Keep the customDateRange intact for when user returns to custom-range
      // Don't clear it unless explicitly needed
    }
  };

  const handleCustomDateSelect = (range: any) => {
    if (range) {
      console.log('Date range selected:', { from: range.from, to: range.to });
      
      // Check if we're starting a new selection (only 'from' is selected)
      const isStartingNewSelection = range.from && !range.to;
      
      // Check if we have a complete range
      const hasCompleteRange = range.from && range.to;
      
      setCustomDateRange(range);
      
      if (hasCompleteRange) {
        // Only close when we genuinely have both dates selected
        setDateFilter("custom-range");
        setIsDatePickerOpen(false);
        setIsDateDropdownOpen(false); // Also close the main dropdown
        console.log('Both dates selected, closing calendar and dropdown');
      } else if (isStartingNewSelection) {
        // When starting new selection, keep calendar open and don't set filter yet
        console.log('Start date selected, waiting for end date - keeping calendar open');
        // Don't set dateFilter here, wait for complete range
      }
    }
  };

  const handleClearDateSelection = () => {
    console.log('Clearing date selection');
    setCustomDateRange({ from: undefined, to: undefined });
    // Don't close the calendar, let user select new dates
  };

  const handleAddDateSelect = (date: Date | undefined) => {
    if (date) {
      setNewReport(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0]
      }));
    }
    setIsAddDatePickerOpen(false);
  };

  const handleEditDateSelect = (date: Date | undefined) => {
    if (date) {
      setEditReport(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0]
      }));
    }
    setIsEditDatePickerOpen(false);
  };

  const newReportTotal = newReport.sv1 + newReport.sv2 + newReport.yxp + newReport.kids + newReport.local + newReport.hc1 + newReport.hc2;
  
  const editReportTotal = editReport.sv1 + editReport.sv2 + editReport.yxp + editReport.kids + editReport.local + editReport.hc1 + editReport.hc2;

  const handleInputChange = (field: string, value: string | number) => {
    setNewReport(prev => ({
      ...prev,
      [field]: field === 'location_id' ? value : Number(value) || 0
    }));
  };

  const handleEditInputChange = (field: string, value: string | number) => {
    setEditReport(prev => ({
      ...prev,
      [field]: field === 'location_id' ? value : Number(value) || 0
    }));
  };

  const handleEditReport = (index: number) => {
    const reportData = currentData[index];
    setSelectedReportIndex(index);
    setEditReport({
      date: reportData.date,
      location_id: reportData.location_id || "",
      sv1: reportData.sv1,
      sv2: reportData.sv2,
      yxp: reportData.yxp,
      kids: reportData.kids,
      local: reportData.local,
      hc1: reportData.hc1,
      hc2: reportData.hc2
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveReport = async () => {
    if (!newReport.location_id) {
      alert('Please select a location');
      return;
    }
    
    const reportToAdd: AttendanceReportInsert = {
      date: newReport.date,
      location: "", // Temporary for backward compatibility
      location_id: newReport.location_id,
      sv1: newReport.sv1,
      sv2: newReport.sv2,
      yxp: newReport.yxp,
      kids: newReport.kids,
      local: newReport.local,
      hc1: newReport.hc1,
      hc2: newReport.hc2,
    };
    
    try {
      await createReportMutation.mutateAsync(reportToAdd);
      
      // Reset form and close dialog only on success
      setNewReport({
        date: new Date().toISOString().split('T')[0],
        location_id: "",
        sv1: 0,
        sv2: 0,
        yxp: 0,
        kids: 0,
        local: 0,
        hc1: 0,
        hc2: 0
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to create report:', error);
    }
  };

  const handleSaveEditReport = async () => {
    if (!editReport.location_id || selectedReportIndex === null) {
      alert('Please select a location');
      return;
    }

    const reportToUpdate = currentData[selectedReportIndex];
    if (!reportToUpdate) {
      alert('Report not found');
      return;
    }
    
    const updates = {
      date: editReport.date,
      location: "", // Temporary for backward compatibility
      location_id: editReport.location_id,
      sv1: editReport.sv1,
      sv2: editReport.sv2,
      yxp: editReport.yxp,
      kids: editReport.kids,
      local: editReport.local,
      hc1: editReport.hc1,
      hc2: editReport.hc2,
    };
    
    try {
      await updateReportMutation.mutateAsync({ id: reportToUpdate.id, updates });
      
      // Reset form and close dialog only on success
      setEditReport({
        date: new Date().toISOString().split('T')[0],
        location_id: "",
        sv1: 0,
        sv2: 0,
        yxp: 0,
        kids: 0,
        local: 0,
        hc1: 0,
        hc2: 0
      });
      setSelectedReportIndex(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to update report:', error);
    }
  };


  const getDateRangeText = (filter: string) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    switch (filter) {
      case "this-week":
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek;
        const sunday = new Date(today.setDate(diff));
        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);
        return `${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${saturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        
      case "last-week":
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - 7 - today.getDay());
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        return `${lastWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastWeekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        
      case "this-month":
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return `${startOfMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        
      case "last-month":
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return `${lastMonthStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastMonthEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        
      case "custom-range":
        if (customDateRange.from && customDateRange.to) {
          return `${customDateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${customDateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
        return "Select custom range";
        
      default:
        return "";
    }
  };

  const getTierColor = (tier: string) => {
    const colors = {
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      green: "bg-green-100 text-green-800 border-green-200", 
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      red: "bg-red-100 text-red-800 border-red-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[tier as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">PGA Overview</h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Track and manage attendance for physical garage services.
          </p>
        </div>
        
        <div className="text-left sm:text-right">
          <DropdownMenu open={isDateDropdownOpen} onOpenChange={setIsDateDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 focus:ring-0 focus:ring-offset-0 hover:bg-gray-600 hover:text-white bg-gray-700 text-white border border-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none w-full sm:w-auto">
              <Calendar className="h-4 w-4 text-white" />
              {dateFilter === "this-week" ? "This Week" :
               dateFilter === "last-week" ? "Last Week" :
               dateFilter === "this-month" ? "This Month" :
               dateFilter === "last-month" ? "Last Month" :
               dateFilter === "custom-range" ? "Custom Range" :
               "This Week"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 sm:w-48" align="start" side="bottom">
            <DropdownMenuLabel>Date Filter</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDateFilterChange('this-week')}
              className={`flex items-center gap-3 h-10 sm:h-auto px-3 py-2 ${dateFilter === 'this-week' ? 'bg-gray-100' : ''}`}
            >
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDateFilterChange('last-week')}
              className={`flex items-center gap-3 h-10 sm:h-auto px-3 py-2 ${dateFilter === 'last-week' ? 'bg-gray-100' : ''}`}
            >
              Last Week
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDateFilterChange('this-month')}
              className={`flex items-center gap-3 h-10 sm:h-auto px-3 py-2 ${dateFilter === 'this-month' ? 'bg-gray-100' : ''}`}
            >
              This Month
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDateFilterChange('last-month')}
              className={`flex items-center gap-3 h-10 sm:h-auto px-3 py-2 ${dateFilter === 'last-month' ? 'bg-gray-100' : ''}`}
            >
              Last Month
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start text-left font-normal ${dateFilter === 'custom-range' ? 'bg-accent/30 border-accent/50 text-accent-foreground' : 'hover:bg-accent/20 hover:border-accent/30'}`}
                    onClick={() => {
                      console.log('Opening calendar with existing range:', customDateRange);
                      setIsDatePickerOpen(true);
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Custom Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  {customDateRange.from && customDateRange.to && (
                    <div className="p-3 border-b border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearDateSelection}
                        className="w-full text-xs sm:text-xs h-8 sm:h-8"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  )}
                  <div className="p-1 sm:p-0">
                    <CalendarComponent
                      mode="range"
                      defaultMonth={customDateRange.from || new Date()}
                      selected={{ from: customDateRange.from, to: customDateRange.to }}
                      onSelect={handleCustomDateSelect}
                      numberOfMonths={1}
                      initialFocus
                      className="scale-95 sm:scale-100"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-xs text-gray-400 mt-1">
          {getDateRangeText(dateFilter)}
        </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3 sm:px-4">
              <CardTitle className="text-sm font-medium">1Sv</CardTitle>
              <div className="rounded-full bg-gray-100 p-2 sm:p-2.5">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold">{isLoadingMetrics ? '...' : (dashboardMetrics?.sv1 || 0)}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3 sm:px-4">
              <CardTitle className="text-sm font-medium">2Sv</CardTitle>
              <div className="rounded-full bg-gray-100 p-2 sm:p-2.5">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold">{isLoadingMetrics ? '...' : (dashboardMetrics?.sv2 || 0)}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3 sm:px-4">
              <CardTitle className="text-sm font-medium">YXP</CardTitle>
              <div className="rounded-full bg-gray-100 p-2 sm:p-2.5">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold">{isLoadingMetrics ? '...' : (dashboardMetrics?.yxp || 0)}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3 sm:px-4">
              <CardTitle className="text-sm font-medium">Kids</CardTitle>
              <div className="rounded-full bg-gray-100 p-2 sm:p-2.5">
                <Baby className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold">{isLoadingMetrics ? '...' : (dashboardMetrics?.kids || 0)}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3 sm:px-4">
              <CardTitle className="text-sm font-medium">Local</CardTitle>
              <div className="rounded-full bg-gray-100 p-2 sm:p-2.5">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold">{isLoadingMetrics ? '...' : (dashboardMetrics?.local || 0)}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3 sm:px-4">
              <CardTitle className="text-sm font-medium">HC1</CardTitle>
              <div className="rounded-full bg-gray-100 p-2 sm:p-2.5">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold">{isLoadingMetrics ? '...' : (dashboardMetrics?.hc1 || 0)}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3 sm:px-4">
              <CardTitle className="text-sm font-medium">HC2</CardTitle>
              <div className="rounded-full bg-gray-100 p-2 sm:p-2.5">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold">{isLoadingMetrics ? '...' : (dashboardMetrics?.hc2 || 0)}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-none bg-accent/5 border-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 pt-2 px-3 sm:px-4">
              <CardTitle className="text-sm font-medium text-accent-dark">Overall</CardTitle>
              <div className="rounded-full bg-accent/10 p-2 sm:p-2.5">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-accent-dark" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2 px-3 sm:px-4">
              <div className="text-xl sm:text-2xl font-bold text-accent-dark">{isLoadingMetrics ? '...' : (dashboardMetrics?.overall || 0)}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h2 className="text-lg font-semibold">PGA by Location</h2>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 focus:ring-0 focus:ring-offset-0 hover:bg-gray-50 w-full sm:w-auto"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <FilePlus2 className="h-4 w-4" />
              <span className="sm:inline">Add Report</span>
            </Button>
            
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 focus:ring-0 focus:ring-offset-0 hover:bg-gray-50 w-full sm:w-auto justify-center sm:justify-start">
                <ListFilter className="h-4 w-4 text-gray-600" />
                <span className="hidden sm:inline">Filter by Tier</span>
                <span className="sm:hidden">Filter</span>
                {tierFilter !== 'all' && (
                  <span className={`w-2 h-2 rounded-full ml-1 ${
                    tierFilter === 'purple' ? 'bg-purple-500' :
                    tierFilter === 'green' ? 'bg-green-500' :
                    tierFilter === 'yellow' ? 'bg-yellow-500' :
                    tierFilter === 'orange' ? 'bg-orange-500' :
                    tierFilter === 'red' ? 'bg-red-500' :
                    tierFilter === 'blue' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`}></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuLabel>Filter by Tier</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleTierFilterChange('all')}
                className={`flex items-center gap-3 ${tierFilter === 'all' ? 'bg-gray-100' : ''}`}
              >
                All Tiers
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleTierFilterChange('purple')}
                className={`flex items-center gap-3 ${tierFilter === 'purple' ? 'bg-gray-100' : ''}`}
              >
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                Purple
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleTierFilterChange('green')}
                className={`flex items-center gap-3 ${tierFilter === 'green' ? 'bg-gray-100' : ''}`}
              >
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Green
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleTierFilterChange('yellow')}
                className={`flex items-center gap-3 ${tierFilter === 'yellow' ? 'bg-gray-100' : ''}`}
              >
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                Yellow
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleTierFilterChange('orange')}
                className={`flex items-center gap-3 ${tierFilter === 'orange' ? 'bg-gray-100' : ''}`}
              >
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                Orange
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleTierFilterChange('red')}
                className={`flex items-center gap-3 ${tierFilter === 'red' ? 'bg-gray-100' : ''}`}
              >
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Red
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleTierFilterChange('blue')}
                className={`flex items-center gap-3 ${tierFilter === 'blue' ? 'bg-gray-100' : ''}`}
              >
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Blue
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleTierFilterChange('gray')}
                className={`flex items-center gap-3 ${tierFilter === 'gray' ? 'bg-gray-100' : ''}`}
              >
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                Gray
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          {reportsError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">Error loading reports: {reportsError.message}</p>
            </div>
          )}
          
          {isLoadingReports ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600">Loading reports...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b-2">
                    <TableHead className="w-32 font-semibold text-gray-700 py-3 first:rounded-tl-lg">LOCATION</TableHead>
                    <TableHead className="text-center w-16 font-semibold text-gray-700 py-3">1SV</TableHead>
                    <TableHead className="text-center w-16 font-semibold text-gray-700 py-3">2SV</TableHead>
                    <TableHead className="text-center w-16 font-semibold text-gray-700 py-3">YXP</TableHead>
                    <TableHead className="text-center w-16 font-semibold text-gray-700 py-3">KIDS</TableHead>
                    <TableHead className="text-center w-16 font-semibold text-gray-700 py-3">LOCAL</TableHead>
                    <TableHead className="text-center w-16 font-semibold text-gray-700 py-3">HC1</TableHead>
                    <TableHead className="text-center w-16 font-semibold text-gray-700 py-3">HC2</TableHead>
                    <TableHead className="text-center w-16 font-bold text-gray-800 py-3">TOTAL</TableHead>
                    <TableHead className="text-center w-20 font-semibold text-gray-700 py-3">TIER</TableHead>
                    <TableHead className="text-center w-16 font-semibold text-gray-700 py-3 last:rounded-tr-lg">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                  No attendance reports found. Create your first report to get started!
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, index) => {
                const total = row.total_attendance || (row.sv1 + row.sv2 + row.yxp + row.local + row.hc1 + row.hc2 + row.kids);
                return (
                  <TableRow key={row.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium w-32">{row.location?.name || row.location || 'Unknown Location'}</TableCell>
                    <TableCell className="text-center w-16">{row.sv1}</TableCell>
                    <TableCell className="text-center w-16">{row.sv2}</TableCell>
                    <TableCell className="text-center w-16">{row.yxp}</TableCell>
                    <TableCell className="text-center w-16">{row.kids}</TableCell>
                    <TableCell className="text-center w-16">{row.local}</TableCell>
                    <TableCell className="text-center w-16">{row.hc1}</TableCell>
                    <TableCell className="text-center w-16">{row.hc2}</TableCell>
                    <TableCell className="text-center w-16 font-semibold">{total}</TableCell>
                    <TableCell className="text-center w-20">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTierColor(row.tier || 'gray')}`}>
                        {(row.tier || 'gray').charAt(0).toUpperCase() + (row.tier || 'gray').slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center w-16">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 sm:h-8 sm:w-8 p-0 hover:bg-gray-200 min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]"
                        onClick={() => handleEditReport(index)}
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
              </Table>
            </div>
          )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <Select value={rowsPerPage} onValueChange={handleRowsPerPageChange}>
                  <SelectTrigger className="w-16 h-8 focus:ring-0 focus:ring-offset-0">
                    <SelectValue className="text-gray-600" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="text-sm text-gray-600 text-center sm:text-left">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows} rows
                </div>
                
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-gray-50"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4 text-gray-600" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-gray-50"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-gray-50"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-gray-50"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Add Report Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent/20 border border-accent/20">
                <FilePlus2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">Add Attendance Report</DialogTitle>
                <p className="text-xs sm:text-sm text-gray-500">Record attendance numbers for each service</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Date and Location Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-900">
                  Date
                </Label>
                <Popover open={isAddDatePickerOpen} onOpenChange={setIsAddDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-start text-left font-normal border-gray-300 hover:bg-gray-50 focus:border-accent focus:ring-0 focus:ring-offset-0 focus:outline-none rounded-lg"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {newReport.date ? new Date(newReport.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newReport.date ? new Date(newReport.date) : undefined}
                      onSelect={handleAddDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-900">
                  Location
                </Label>
                <LocationSelect
                  value={newReport.location_id}
                  onValueChange={(locationId) => handleInputChange('location_id', locationId)}
                  placeholder="Select location..."
                />
              </div>
            </div>

            {/* Main Services 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { key: 'sv1', label: '1Sv' },
                { key: 'sv2', label: '2Sv' },
                { key: 'yxp', label: 'YXP' },
                { key: 'kids', label: 'Kids' }
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm font-medium text-gray-700">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    min="0"
                    value={newReport[key as keyof typeof newReport]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="h-10 text-base border-gray-300 focus:border-accent focus:ring-0 focus:ring-offset-0 focus:outline-none rounded-lg"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            {/* Local, HC1, HC2 in single row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'local', label: 'Local' },
                { key: 'hc1', label: 'HC1' },
                { key: 'hc2', label: 'HC2' }
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm font-medium text-gray-700">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type="number"
                    min="0"
                    value={newReport[key as keyof typeof newReport]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="h-10 text-base border-gray-300 focus:border-accent focus:ring-0 focus:ring-offset-0 focus:outline-none rounded-lg"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            {/* Results Section */}
            <div className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Attendance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">{newReportTotal}</span>
                  <span className="text-sm text-gray-500">people</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              className="px-6 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveReport}
              disabled={createReportMutation.isPending}
              className="px-6 py-2 text-sm font-medium bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm transition-all duration-200 text-white disabled:opacity-50"
            >
              {createReportMutation.isPending ? 'Saving...' : 'Save Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent/20 border border-accent/20">
                <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">Edit Attendance Report</DialogTitle>
                <p className="text-xs sm:text-sm text-gray-500">Update attendance numbers for each service</p>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Date and Location Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date" className="text-sm font-medium text-gray-900">
                  Date
                </Label>
                <Popover open={isEditDatePickerOpen} onOpenChange={setIsEditDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-start text-left font-normal border-gray-300 hover:bg-gray-50 focus:border-accent focus:ring-0 focus:ring-offset-0 focus:outline-none rounded-lg"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {editReport.date ? new Date(editReport.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={editReport.date ? new Date(editReport.date) : undefined}
                      onSelect={handleEditDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-location" className="text-sm font-medium text-gray-900">
                  Location
                </Label>
                <LocationSelect
                  value={editReport.location_id}
                  onValueChange={(locationId) => handleEditInputChange('location_id', locationId)}
                  placeholder="Select location..."
                />
              </div>
            </div>

            {/* Main Services 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { key: 'sv1', label: '1Sv' },
                { key: 'sv2', label: '2Sv' },
                { key: 'yxp', label: 'YXP' },
                { key: 'kids', label: 'Kids' }
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`edit-${key}`} className="text-sm font-medium text-gray-700">
                    {label}
                  </Label>
                  <Input
                    id={`edit-${key}`}
                    type="number"
                    min="0"
                    value={editReport[key as keyof typeof editReport]}
                    onChange={(e) => handleEditInputChange(key, e.target.value)}
                    className="h-10 text-base border-gray-300 focus:border-accent focus:ring-0 focus:ring-offset-0 focus:outline-none rounded-lg"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            {/* Local, HC1, HC2 in single row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'local', label: 'Local' },
                { key: 'hc1', label: 'HC1' },
                { key: 'hc2', label: 'HC2' }
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`edit-${key}`} className="text-sm font-medium text-gray-700">
                    {label}
                  </Label>
                  <Input
                    id={`edit-${key}`}
                    type="number"
                    min="0"
                    value={editReport[key as keyof typeof editReport]}
                    onChange={(e) => handleEditInputChange(key, e.target.value)}
                    className="h-10 text-base border-gray-300 focus:border-accent focus:ring-0 focus:ring-offset-0 focus:outline-none rounded-lg"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            {/* Results Section */}
            <div className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Total Attendance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">{editReportTotal}</span>
                  <span className="text-sm text-gray-500">people</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="px-6 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEditReport}
              disabled={updateReportMutation.isPending}
              className="px-6 py-2 text-sm font-medium bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm transition-all duration-200 text-white disabled:opacity-50"
            >
              {updateReportMutation.isPending ? 'Updating...' : 'Update Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}