import { useEffect, useState, useMemo } from "react"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"
import { api } from "@/src/lib/api"
import { Product } from "@/src/types"
import { mockProducts } from "@/src/lib/mockData"
import { 
  Plus, Search, Filter, Pencil, Trash2, Tag, 
  DollarSign, Layers, TriangleAlert, Cpu, Server, 
  TrendingUp, Box, Check, Database, Code, Info, ArrowUpRight
} from "lucide-react"
import { showToast } from "@/src/lib/toast"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(mockProducts as Product[])
  const [activeTab, setActiveTab] = useState<"catalog" | "specs">("catalog")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "stock">("name")
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "Apparel",
    price: "",
    stock: "",
    description: ""
  })
  const [submitting, setSubmitting] = useState(false)

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products")
      setProducts(res)
    } catch (err) {
      // keep mock data
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Open modal for creation
  const handleCreateOpen = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      category: "Apparel",
      price: "",
      stock: "",
      description: ""
    })
    setIsModalOpen(true)
  }

  // Open modal for edit
  const handleEditOpen = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description
    })
    setIsModalOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    try {
      await api.delete(`/api/products/${id}`)
      showToast("Product deleted successfully", "success")
      fetchProducts()
    } catch (err) {
      console.error(err)
      showToast("Failed to delete product", "error")
    }
  }

  // Handle Form Submit (Create/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showToast("Product name is required", "error")
      return
    }
    const priceNum = Number(formData.price)
    const stockNum = Number(formData.stock)
    if (isNaN(priceNum) || priceNum < 0) {
      showToast("Price must be a valid positive number", "error")
      return
    }
    if (isNaN(stockNum) || stockNum < 0) {
      showToast("Stock must be a valid positive number", "error")
      return
    }

    setSubmitting(true)
    try {
      if (editingProduct) {
        // Update
        await api.put(`/api/products/${editingProduct.id}`, {
          name: formData.name,
          category: formData.category,
          price: priceNum,
          stock: stockNum,
          description: formData.description
        })
        showToast("Product updated successfully", "success")
      } else {
        // Create
        await api.post("/api/products", {
          name: formData.name,
          category: formData.category,
          price: priceNum,
          stock: stockNum,
          description: formData.description
        })
        showToast("Product created successfully", "success")
      }
      setIsModalOpen(false)
      fetchProducts()
    } catch (err) {
      console.error(err)
      showToast("Failed to save product details", "error")
    }
    setSubmitting(false)
  }

  // Memoized Categories
  const categories = useMemo(() => {
    if (!products) return ["Apparel", "Electronics", "Furniture", "General"]
    const cats = new Set(products.map(p => p.category))
    return ["All", ...Array.from(cats)]
  }, [products])

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    if (!products) return []
    let result = products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = 
        selectedCategory === "All" || 
        p.category.toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCategory
    })

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "price-asc") return a.price - b.price
      if (sortBy === "price-desc") return b.price - a.price
      if (sortBy === "stock") return b.stock - a.stock
      return 0
    })
  }, [products, searchTerm, selectedCategory, sortBy])

  // Metric aggregates
  const metrics = useMemo(() => {
    if (!products) return { totalValue: 0, outOfStock: 0, totalRevenue: 0, totalSales: 0 }
    return products.reduce((acc, p) => {
      acc.totalValue += p.price * p.stock
      if (p.stock === 0) acc.outOfStock++
      acc.totalRevenue += p.revenue || 0
      acc.totalSales += p.sales || 0
      return acc
    }, { totalValue: 0, outOfStock: 0, totalRevenue: 0, totalSales: 0 })
  }, [products])

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader 
        title="Products & Details" 
        subtitle="Manage product database and view CRM specifications."
        action={
          activeTab === "catalog" ? (
            <Button variant="salmon" className="gap-2" onClick={handleCreateOpen}>
              <Plus size={16} /> New Product
            </Button>
          ) : undefined
        }
      />

      {/* Tabs bar */}
      <div className="flex gap-4 border-b border-subtle pb-px">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-4 px-2 text-[15px] font-bold border-b-2 transition-all ${activeTab === "catalog" ? "border-accent text-accent" : "border-transparent text-muted hover:text-primary"}`}
        >
          Product Catalog
        </button>
        <button
          onClick={() => setActiveTab("specs")}
          className={`pb-4 px-2 text-[15px] font-bold border-b-2 transition-all ${activeTab === "specs" ? "border-accent text-accent" : "border-transparent text-muted hover:text-primary"}`}
        >
          Project Specifications
        </button>
      </div>

      {activeTab === "catalog" ? (
        <>
          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="p-6 border border-subtle bg-surface">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted">Total Stock Value</span>
                <div className="w-8 h-8 rounded-full border border-subtle flex items-center justify-center text-primary shadow-sm bg-[#fdfdfd]">
                  <DollarSign size={14} className="text-accent" />
                </div>
              </div>
              <h4 className="text-[24px] font-bold tracking-tight text-primary">
                {products === null ? <Skeleton className="h-7 w-28" /> : `$${metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h4>
              <p className="text-[11px] text-muted font-semibold mt-1">Based on current stock levels</p>
            </Card>

            <Card className="p-6 border border-subtle bg-surface">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted">Stock Health</span>
                <div className="w-8 h-8 rounded-full border border-subtle flex items-center justify-center text-primary shadow-sm bg-[#fdfdfd]">
                  <TriangleAlert size={14} className="text-accent" />
                </div>
              </div>
              <h4 className="text-[24px] font-bold tracking-tight text-primary">
                {products === null ? <Skeleton className="h-7 w-12" /> : metrics.outOfStock}
              </h4>
              <p className="text-[11px] text-muted font-semibold mt-1">Out of stock product items</p>
            </Card>

            <Card className="p-6 border border-subtle bg-surface">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted">Total Sales Revenue</span>
                <div className="w-8 h-8 rounded-full border border-subtle flex items-center justify-center text-primary shadow-sm bg-[#fdfdfd]">
                  <TrendingUp size={14} className="text-accent" />
                </div>
              </div>
              <h4 className="text-[24px] font-bold tracking-tight text-primary">
                {products === null ? <Skeleton className="h-7 w-28" /> : `$${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </h4>
              <p className="text-[11px] text-muted font-semibold mt-1">From {metrics.totalSales} total items sold</p>
            </Card>

            <Card className="p-6 border border-subtle bg-surface">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted">Catalog Items</span>
                <div className="w-8 h-8 rounded-full border border-subtle flex items-center justify-center text-primary shadow-sm bg-[#fdfdfd]">
                  <Box size={14} className="text-accent" />
                </div>
              </div>
              <h4 className="text-[24px] font-bold tracking-tight text-primary">
                {products === null ? <Skeleton className="h-7 w-16" /> : products.length}
              </h4>
              <p className="text-[11px] text-muted font-semibold mt-1">Active products across {categories.length - 1} categories</p>
            </Card>
          </div>

          {/* Search, Filter, Sort toolbar */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mt-2 max-w-[800px] w-full">
            <div className="relative flex-1 group shadow-[0_2px_15px_rgba(0,0,0,0.02)] rounded-full">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors">
                <Search size={16} />
              </div>
              <input 
                type="text"
                placeholder="Search products by name or details..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-surface border border-subtle h-12 pl-12 pr-5 text-[14px] font-semibold rounded-full outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary placeholder:text-muted"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-surface border border-subtle h-12 px-4 rounded-full shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
              <Filter size={14} className="text-muted" />
              <select 
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent border-0 outline-none text-[13px] font-bold text-primary pr-2 cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-surface border border-subtle h-12 px-4 rounded-full shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
              <Layers size={14} className="text-muted" />
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent border-0 outline-none text-[13px] font-bold text-primary pr-2 cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock">Sort by Stock</option>
              </select>
            </div>
          </div>

          {/* Grid of Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-4">
            {products === null ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="p-7 border border-subtle bg-surface h-72 flex flex-col justify-between">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-9 w-20 rounded-full" />
                  </div>
                </Card>
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-3 text-center py-20 text-muted font-bold text-[16px] bg-surface rounded-[2.5rem] border border-subtle shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                No products found matching the criteria.
              </div>
            ) : (
              filteredProducts.map(p => (
                <Card key={p.id} className="p-7 border border-subtle bg-surface flex flex-col justify-between hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition-all duration-300 relative group overflow-hidden">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <CategoryBadge category={p.category} />
                      <StockBadge stock={p.stock} />
                    </div>
                    
                    <h3 className="font-bold text-[18px] text-primary tracking-tight leading-snug mt-1">{p.name}</h3>
                    <p className="text-[13px] text-muted font-medium line-clamp-3 leading-relaxed mt-1 min-h-[55px]">
                      {p.description || "No description provided."}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-subtle flex justify-between items-end">
                    <div>
                      <p className="text-[11px] text-muted font-bold">Unit Price</p>
                      <p className="text-[20px] font-bold text-primary tracking-tight">${p.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted font-bold text-right">Revenue Sold</p>
                      <p className="text-[16px] font-bold text-accent tracking-tight text-right">${(p.revenue || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Actions overlay panel */}
                  <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-surface/90 backdrop-blur-sm p-1.5 rounded-full border border-subtle shadow-md">
                    <button 
                      onClick={() => handleEditOpen(p)}
                      className="p-2 hover:bg-background rounded-full text-primary transition-colors"
                      title="Edit Product"
                    >
                      <Pencil size={13} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-2 hover:bg-[#fce8e6] hover:text-accent rounded-full text-muted transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        /* Specs view */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
          {/* Tech Stack specs card */}
          <Card className="border border-subtle bg-surface p-8">
            <h3 className="text-[20px] font-bold text-primary flex items-center gap-2 mb-6">
              <Code className="text-accent" size={20} />
              Technical Stack Specs
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-background border border-subtle rounded-full flex items-center justify-center shrink-0">
                  <Cpu className="text-accent" size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[14px] text-primary">Core Frontend Architecture</h4>
                  <p className="text-[13px] text-muted leading-relaxed font-semibold mt-0.5">
                    Built using React 19, TypeScript 5.8, and structured using a modular file-based component hierarchy. Styled with Vanilla Tailwind CSS v4 for utility-first responsive sizing, HSL theme colors, and fluid designs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-background border border-subtle rounded-full flex items-center justify-center shrink-0">
                  <Server className="text-accent" size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[14px] text-primary">Node Express Server Engine</h4>
                  <p className="text-[13px] text-muted leading-relaxed font-semibold mt-0.5">
                    Express.ts application running locally on port 3000, serving backend REST APIs. Leverages tsx for hot-reloading server changes and uses a bundled build system powered by esbuild for production.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-background border border-subtle rounded-full flex items-center justify-center shrink-0">
                  <Info className="text-accent" size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[14px] text-primary">Gemini 3.5 Flash Model Integration</h4>
                  <p className="text-[13px] text-muted leading-relaxed font-semibold mt-0.5">
                    Integrates with the brand-new `@google/genai` (v2.4) package to make direct content requests to the Gemini 3.5 Flash API. This drives the CRM copywriting AI Draft assistant and natural language segment filter parser.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-background border border-subtle rounded-full flex items-center justify-center shrink-0">
                  <Database className="text-accent" size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[14px] text-primary">In-Memory JSON Database</h4>
                  <p className="text-[13px] text-muted leading-relaxed font-semibold mt-0.5">
                    Maintains an in-memory data store containing records for customers, segment rules, campaigns, and catalog products, ensuring fast response times and predictable testing.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* API endpoints specs card */}
          <Card className="border border-subtle bg-surface p-8">
            <h3 className="text-[20px] font-bold text-primary flex items-center gap-2 mb-6">
              <Database className="text-accent" size={20} />
              API Endpoints Specs
            </h3>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[420px] pr-2">
              <EndpointItem method="GET" path="/api/dashboard/summary" desc="Fetches general CRM metrics, active counts, recent campaigns, and feed events." />
              <EndpointItem method="GET" path="/api/customers" desc="Retrieves the lists of registered client contact information and channels." />
              <EndpointItem method="GET" path="/api/segments" desc="Retrieves segment rule definitions and counts of matching customers." />
              <EndpointItem method="POST" path="/api/segments" desc="Creates a new customer segment based on conditional rules." />
              <EndpointItem method="POST" path="/api/segments/preview" desc="Calculates match sizes and customer samples dynamically." />
              <EndpointItem method="GET" path="/api/campaigns" desc="Gets the history and parameters of sent message campaigns." />
              <EndpointItem method="POST" path="/api/campaigns" desc="Saves and schedules a new customer drip or newsletter campaign." />
              <EndpointItem method="GET" path="/api/products" desc="Fetches the complete retail product list." />
              <EndpointItem method="POST" path="/api/products" desc="Adds a new product to the catalog inventory." />
              <EndpointItem method="PUT" path="/api/products/:id" desc="Modifies item parameters like price and stock levels." />
              <EndpointItem method="DELETE" path="/api/products/:id" desc="Permanently removes a product listing." />
              <EndpointItem method="POST" path="/api/ai/draft" desc="Calls Gemini API to generate professional promotional messages." />
              <EndpointItem method="POST" path="/api/ai/segment" desc="Parses text requests into structured segment rules." />
            </div>
          </Card>
        </div>
      )}

      {/* Add / Edit modal popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
          <Card className="w-full max-w-[500px] border border-subtle shadow-2xl p-0 overflow-hidden bg-surface max-h-[90vh] flex flex-col">
            <div className="px-8 py-5 border-b border-subtle flex justify-between items-center bg-background/30">
              <h3 className="font-bold text-[17px] text-primary">
                {editingProduct ? "Edit Product Details" : "Create New Product"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-subtle hover:bg-background flex items-center justify-center font-bold text-muted transition-all text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">Product Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Premium Leather Jacket"
                  required
                  className="w-full bg-[#fdfdfd] border border-subtle h-11 px-4 text-[14px] font-semibold rounded-full outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-[#fdfdfd] border border-subtle h-11 px-4 text-[14px] font-bold rounded-full outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary cursor-pointer"
                  >
                    <option value="Apparel">Apparel</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="19.99"
                    required
                    className="w-full bg-[#fdfdfd] border border-subtle h-11 px-4 text-[14px] font-semibold rounded-full outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">Stock Quantity</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.stock}
                  onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="100"
                  required
                  className="w-full bg-[#fdfdfd] border border-subtle h-11 px-4 text-[14px] font-semibold rounded-full outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide product parameters, size chart, fabric info, compatibility notes..."
                  className="w-full bg-[#fdfdfd] border border-subtle rounded-2xl p-4 text-[14px] font-semibold outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-primary h-24 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-subtle flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-6 text-[13px] font-bold"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="salmon"
                  className="h-11 px-8 text-[13px] font-bold"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

function CategoryBadge({ category }: { category: string }) {
  switch (category) {
    case "Apparel": return <Badge variant="success">Apparel</Badge>
    case "Electronics": return <Badge variant="warning">Electronics</Badge>
    case "Furniture": return <Badge variant="outline">Furniture</Badge>
    default: return <Badge variant="default">{category}</Badge>
  }
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="danger">Out of Stock</Badge>
  if (stock < 15) return <Badge variant="warning">Low Stock ({stock})</Badge>
  return <Badge variant="success">In Stock ({stock})</Badge>
}

interface EndpointItemProps {
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
  desc: string
}

function EndpointItem({ method, path, desc }: EndpointItemProps) {
  const methodColor = () => {
    if (method === "GET") return "bg-[#e6f4ea] text-[#1e8e3e]"
    if (method === "POST") return "bg-[#fce8e6] text-accent"
    if (method === "PUT") return "bg-[#fef7e0] text-[#f29900]"
    return "bg-gray-150 text-gray-700"
  }

  return (
    <div className="flex gap-4 p-4 border border-subtle bg-[#fcfcfc] rounded-2xl hover:border-accent/15 transition-all group">
      <div className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full shrink-0 flex items-center justify-center ${methodColor()} w-16 h-7`}>
        {method}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 justify-between">
          <code className="text-[13px] font-bold text-primary truncate">{path}</code>
          <ArrowUpRight size={13} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-[11px] text-muted font-medium mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
