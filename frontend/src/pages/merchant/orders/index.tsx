import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import MerchantLayout from "@/components/merchant/MerchantLayout";

// Mock order data
const orders = [
  {
    id: "ORD-10001",
    customerName: "Alex Johnson",
    customerEmail: "alex.johnson@example.com",
    date: "2025-04-15T14:30:00",
    total: 129.99,
    status: "Delivered",
    paymentStatus: "Paid",
    items: 3,
    shippingMethod: "Standard Shipping",
  },
  {
    id: "ORD-10002",
    customerName: "Sarah Williams",
    customerEmail: "sarah.williams@example.com",
    date: "2025-04-16T09:15:00",
    total: 89.5,
    status: "Processing",
    paymentStatus: "Paid",
    items: 2,
    shippingMethod: "Express Shipping",
  },
  {
    id: "ORD-10003",
    customerName: "Michael Brown",
    customerEmail: "michael.brown@example.com",
    date: "2025-04-17T11:45:00",
    total: 210.75,
    status: "Shipped",
    paymentStatus: "Paid",
    items: 4,
    shippingMethod: "Standard Shipping",
  },
  {
    id: "ORD-10004",
    customerName: "Emily Davis",
    customerEmail: "emily.davis@example.com",
    date: "2025-04-18T16:20:00",
    total: 45.99,
    status: "Pending",
    paymentStatus: "Awaiting Payment",
    items: 1,
    shippingMethod: "Standard Shipping",
  },
  {
    id: "ORD-10005",
    customerName: "David Wilson",
    customerEmail: "david.wilson@example.com",
    date: "2025-04-19T10:30:00",
    total: 156.5,
    status: "Cancelled",
    paymentStatus: "Refunded",
    items: 3,
    shippingMethod: "Express Shipping",
  },
  {
    id: "ORD-10006",
    customerName: "Jennifer Taylor",
    customerEmail: "jennifer.taylor@example.com",
    date: "2025-04-20T13:45:00",
    total: 78.25,
    status: "Delivered",
    paymentStatus: "Paid",
    items: 2,
    shippingMethod: "Standard Shipping",
  },
  {
    id: "ORD-10007",
    customerName: "Robert Martinez",
    customerEmail: "robert.martinez@example.com",
    date: "2025-04-21T09:10:00",
    total: 135.0,
    status: "Processing",
    paymentStatus: "Paid",
    items: 3,
    shippingMethod: "Express Shipping",
  },
  {
    id: "ORD-10008",
    customerName: "Lisa Anderson",
    customerEmail: "lisa.anderson@example.com",
    date: "2025-04-22T14:25:00",
    total: 67.99,
    status: "Shipped",
    paymentStatus: "Paid",
    items: 1,
    shippingMethod: "Standard Shipping",
  },
];

const OrdersPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Available statuses for filtering
  const statuses = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  // Available payment statuses for filtering
  const paymentStatuses = ["All", "Paid", "Awaiting Payment", "Refunded"];

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" || order.status === selectedStatus;
      const matchesPaymentStatus =
        selectedPaymentStatus === "All" ||
        order.paymentStatus === selectedPaymentStatus;

      return matchesSearch && matchesStatus && matchesPaymentStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "total") {
        return sortOrder === "asc" ? a.total - b.total : b.total - a.total;
      } else if (sortBy === "customer") {
        return sortOrder === "asc"
          ? a.customerName.localeCompare(b.customerName)
          : b.customerName.localeCompare(a.customerName);
      }
      return 0;
    });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (
    e: React.ChangeEvent<HTMLInputElement>,
    orderId: string,
  ) => {
    if (e.target.checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Awaiting Payment":
        return "bg-yellow-100 text-yellow-800";
      case "Refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedOrders.length === 0) {
      alert("Please select at least one order");
      return;
    }

    // In a real app, this would call an API to perform the action
    alert(`Performing ${action} on orders: ${selectedOrders.join(", ")}`);
  };

  return (
    <>
      <Head>
        <title>Orders | Merchant Portal | av|nu</title>
        <meta
          name="description"
          content="Manage your orders on av|nu marketplace"
        />
      </Head>

      <MerchantLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              {selectedOrders.length > 0 && (
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-l-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                    onClick={() => handleBulkAction("print-invoices")}
                  >
                    <DocumentTextIcon
                      className="-ml-1 mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    Print Invoices
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                    onClick={() => handleBulkAction("update-shipping")}
                  >
                    <TruckIcon
                      className="-ml-1 mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    Update Shipping
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 bg-white shadow rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-sage focus:border-sage sm:text-sm"
                  placeholder="Search orders by ID, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <AdjustmentsHorizontalIcon
                    className="-ml-0.5 mr-2 h-4 w-4"
                    aria-hidden="true"
                  />
                  Filters
                  <ChevronDownIcon
                    className="ml-2 h-4 w-4"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Order Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm rounded-md"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="paymentStatus"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Payment Status
                  </label>
                  <select
                    id="paymentStatus"
                    name="paymentStatus"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm rounded-md"
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  >
                    {paymentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sortBy"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sort By
                  </label>
                  <select
                    id="sortBy"
                    name="sortBy"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm rounded-md"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setSortOrder("desc");
                    }}
                  >
                    <option value="date">Date</option>
                    <option value="total">Total</option>
                    <option value="customer">Customer Name</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Orders Table */}
          <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-sage focus:ring-sage border-gray-300 rounded"
                          checked={
                            selectedOrders.length === filteredOrders.length &&
                            filteredOrders.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort("customer")}
                      >
                        Customer
                        <ArrowsUpDownIcon
                          className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort("date")}
                      >
                        Date
                        <ArrowsUpDownIcon
                          className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Payment
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort("total")}
                      >
                        Total
                        <ArrowsUpDownIcon
                          className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-sage focus:ring-sage border-gray-300 rounded"
                              checked={selectedOrders.includes(order.id)}
                              onChange={(e) => handleSelectOrder(e, order.id)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items} items
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/merchant/orders/${order.id}`}
                            className="text-sage hover:text-sage/80"
                          >
                            <EyeIcon
                              className="h-5 w-5 inline"
                              aria-hidden="true"
                            />
                            <span className="sr-only">View</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-10 text-center text-sm text-gray-500"
                      >
                        No orders found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </MerchantLayout>
    </>
  );
};

export default OrdersPage;
