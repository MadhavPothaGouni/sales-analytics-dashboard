import io from "socket.io-client";
import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const socket = io("http://localhost:5000");

const AnalyticsDashboard = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const [productSort, setProductSort] = useState({ field: "revenue", direction: "desc" });
  const [customerSort, setCustomerSort] = useState({ field: "revenue", direction: "desc" });
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/sales", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
    socket.on("salesUpdated", fetchAnalytics);
    return () => socket.off("salesUpdated");
  }, [startDate, endDate]);

  if (loading || !analytics) return <p>Loading...</p>;

  const sortData = (data, sort, searchTerm) => {
    return [...data]
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => (sort.direction === "asc" ? a[sort.field] - b[sort.field] : b[sort.field] - a[sort.field]));
  };

  const handleSort = (type, field) => {
    if (type === "product") {
      setProductSort(prev => ({
        field,
        direction: prev.direction === "asc" ? "desc" : "asc",
      }));
    } else {
      setCustomerSort(prev => ({
        field,
        direction: prev.direction === "asc" ? "desc" : "asc",
      }));
    }
  };

  const maxRevenue = Math.max(...analytics.regionSales.map(r => r.revenue));
  const revenueChart = {
    title: {
      text: "Region-wise Revenue",
      left: "center",
      textStyle: { fontWeight: "bold", fontSize: 20, color: "#1976d2" },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(50,50,50,0.8)",
      textStyle: { color: "#fff", fontWeight: "bold" },
      formatter: params => {
        const r = params[0].data;
        return `${params[0].axisValue}<br/>Revenue: $${r.value}`;
      }
    },
    xAxis: { type: "category", data: analytics.regionSales.map(r => r.region), axisTick: { alignWithLabel: true } },
    yAxis: { type: "value" },
    grid: { left: "10%", right: "10%", bottom: "15%" },
    series: [
      {
        type: "bar",
        data: analytics.regionSales.map(r => ({
          value: r.revenue.toFixed(2),
          itemStyle: {
            color: r.revenue === maxRevenue
              ? "#388e3c"
              : {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "#64b5f6" },
                    { offset: 1, color: "#1976d2" }
                  ]
                }
          },
          emphasis: { itemStyle: { color: "#ff9800" } }
        })),
        label: { show: true, position: "top", formatter: "${@[0]}" },
        animationDuration: 1200,
      },
    ],
  };

  const renderBadge = (index, value) => {
    if (index === 0) return <Chip label={`🥇 $${value}`} color="success" size="small" sx={{ ml: 1 }} />;
    if (index === 1) return <Chip label={`🥈 $${value}`} color="info" size="small" sx={{ ml: 1 }} />;
    if (index === 2) return <Chip label={`🥉 $${value}`} color="secondary" size="small" sx={{ ml: 1 }} />;
    return <Chip label={`$${value}`} size="small" sx={{ ml: 1 }} />;
  };

  return (
    <Box sx={{ padding: { xs: 1, sm: 2, md: 3 } }}>
      {/* Gradient Heading */}
      <Typography
  variant="h4"
  gutterBottom
  textAlign="center"
  sx={{
    fontWeight: "light",
    fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
    background: "linear-gradient(270deg, #1976d2, #388e3c, #64b5f6, #00bcd4, #388e3c, #1976d2)",
    backgroundSize: "600% 600%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    mb: 3,
    animation: "gradientShift 8s ease infinite, fadeIn 1.5s ease-in-out",
    "@keyframes gradientShift": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
    "@keyframes fadeIn": {
      "0%": { opacity: 0, transform: "translateY(-20px)" },
      "100%": { opacity: 1, transform: "translateY(0)" },
    },
    textShadow: "0 0 5px rgba(0,0,0,0.2)", // subtle glow
  }}
>
  Sales Analytics Dashboard
</Typography>


      {/* Date Picker Card */}
      <Card sx={{ p: 3, mb: 3, boxShadow: 3, backgroundColor: "white", borderRadius: 2 }}>
  <Grid container spacing={3} alignItems="center">
    <Grid item xs={12} sm={6}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: "#1976d2" }}>
        Start Date
      </Typography>
      <DatePicker
        selected={startDate}
        onChange={setStartDate}
        wrapperClassName="datePicker"
        popperPlacement="bottom-start"
        customInput={
          <TextField
            size="small"
            sx={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: 1,
              boxShadow: 1,
              "&:hover": { boxShadow: 3 },
              cursor: "pointer",
              input: { padding: "10px" },
            }}
          />
        }
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1, color: "#388e3c" }}>
        End Date
      </Typography>
      <DatePicker
        selected={endDate}
        onChange={setEndDate}
        wrapperClassName="datePicker"
        popperPlacement="bottom-start"
        customInput={
          <TextField
            size="small"
            sx={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: 1,
              boxShadow: 1,
              "&:hover": { boxShadow: 3 },
              cursor: "pointer",
              input: { padding: "10px" },
            }}
          />
        }
      />
    </Grid>
  </Grid>
</Card>


      {/* Metrics Cards */}
     <Grid container spacing={2} sx={{ mb: 3 }}>
  <Grid item xs={12}>
    <Card sx={{ 
      display: "flex", 
      justifyContent: "space-around", 
      alignItems: "center", 
      p: 3, 
      boxShadow: 6, 
      borderRadius: 3, 
      background: "linear-gradient(135deg, #1976d2 0%, #388e3c 100%)", 
      color: "#fff",
      "&:hover": { boxShadow: 10 }
    }}>
      {/* Total Revenue */}
      <Box textAlign="left">
        <Typography variant="subtitle1" sx={{ fontWeight: "light", opacity: 0.85 }}>
          Total Revenue
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: "light"}}>
          ${analytics.totalRevenue.toFixed(2)}
        </Typography>
      </Box>

      {/* Divider */}
      <Box sx={{ width: 1, height: 50, backgroundColor: "rgba(255,255,255,0.4)" }} />

      {/* Avg Order Value */}
      <Box textAlign="right">
        <Typography variant="subtitle1" sx={{  opacity: 0.85 }}>
          Avg Order Value
        </Typography>
        <Typography variant="h4" sx={{paddingLeft: 3  }}>
          ${analytics.avgOrderValue.toFixed(2)}
        </Typography>
      </Box>
    </Card>
  </Grid>
</Grid>


      {/* Top Products Accordion */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Top Products</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            label="Search Product"
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            sx={{ mb: 1 }}
          />
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={productSort.field === "revenue"}
                      direction={productSort.direction}
                      onClick={() => handleSort("product", "revenue")}
                    >
                      Revenue
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortData(analytics.topProducts, productSort, productSearch).map((p, idx) => (
                  <TableRow
                    key={p.productId}
                    sx={{ "&:hover": { backgroundColor: "#f5f5f5", cursor: "pointer" }, backgroundColor: idx % 2 === 0 ? "#fafafa" : "white" }}
                  >
                    <TableCell sx={{ fontWeight: idx === 0 ? "bold" : "normal", color: idx === 0 ? "#388e3c" : "inherit" }}>
                      {p.name} {renderBadge(idx, p.revenue.toFixed(2))}
                    </TableCell>
                    <TableCell align="right">${p.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Top Customers Accordion */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Top Customers</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            label="Search Customer"
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
            sx={{ mb: 1 }}
          />
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={customerSort.field === "revenue"}
                      direction={customerSort.direction}
                      onClick={() => handleSort("customer", "revenue")}
                    >
                      Revenue
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortData(analytics.topCustomers, customerSort, customerSearch).map((c, idx) => (
                  <TableRow
                    key={c.customerId}
                    sx={{ "&:hover": { backgroundColor: "#f5f5f5", cursor: "pointer" }, backgroundColor: idx % 2 === 0 ? "#fafafa" : "white" }}
                  >
                    <TableCell sx={{ fontWeight: idx === 0 ? "bold" : "normal", color: idx === 0 ? "#388e3c" : "inherit" }}>
                      {c.name} {renderBadge(idx, c.revenue.toFixed(2))}
                    </TableCell>
                    <TableCell align="right">${c.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Revenue Chart */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <ReactECharts option={revenueChart} style={{ height: "400px", width: "100%" }} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsDashboard;
