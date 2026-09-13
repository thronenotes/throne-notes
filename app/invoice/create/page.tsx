"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Crown, Plus, Trash2, ArrowLeft, ArrowRight, Loader2,
  Upload, ImageIcon, DollarSign, X, Sparkles, Save, Repeat
} from "lucide-react";
import Link from "next/link";

interface LineItem {
  id: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: string;
  imageUrl: string;
}

interface Template {
  id: string;
  templateName: string;
  businessName: string;
  businessAddress: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  businessLogo: string | null;
  defaultCurrency: string;
  defaultTaxRate: number;
  defaultTerms: string | null;
  defaultNotes: string | null;
  isDefault: boolean;
}

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "GHS", label: "GHS (₵)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "NGN", label: "NGN (₦)" },
  { value: "ZAR", label: "ZAR (R)" },
];

const frequencies = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export default function CreateInvoice() {
  const router = useRouter();
  const { user } = useAuth();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // Business
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessLogo, setBusinessLogo] = useState("");

  // Customer
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Invoice meta
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Items
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", itemName: "", description: "", quantity: 1, unitPrice: "", imageUrl: "" },
  ]);

  // Totals
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment due within 14 days of invoice date.");

  // Recurring
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [recurringEndDate, setRecurringEndDate] = useState("");

  useEffect(() => {
    if (user?.id) fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/invoices/templates?userId=${user?.id}`);
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
        const defaultT = data.templates.find((t: Template) => t.isDefault);
        if (defaultT) loadTemplate(defaultT.id, data.templates);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadTemplate = (templateId: string, list?: Template[]) => {
    const t = (list || templates).find((tmpl) => tmpl.id === templateId);
    if (!t) return;
    setSelectedTemplate(t.id);
    setBusinessName(t.businessName);
    setBusinessAddress(t.businessAddress || "");
    setBusinessPhone(t.businessPhone || "");
    setBusinessEmail(t.businessEmail || "");
    setBusinessLogo(t.businessLogo || "");
    setCurrency(t.defaultCurrency || "USD");
    setTaxRate(t.defaultTaxRate || 0);
    setTerms(t.defaultTerms || "Payment due within 14 days of invoice date.");
    setNotes(t.defaultNotes || "");
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), itemName: "", description: "", quantity: 1, unitPrice: "", imageUrl: "" },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBusinessLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleItemImageUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateItem(itemId, "imageUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const subtotal = items.reduce((sum, item) => {
    return sum + Number(item.unitPrice || 0) * Number(item.quantity || 0);
  }, 0);

  const taxAmount = (subtotal * taxRate) / 100;
  const discountAmount = Number(discount || 0);
  const total = subtotal + taxAmount - discountAmount;

  const inputBase = "w-full bg-[#14141E] border border-[#2A2A3E] rounded-lg px-4 py-3 text-[#F5F0E6] text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all placeholder:text-[#5A5A6A]";
  const labelBase = "block text-[11px] uppercase tracking-widest text-[#8A8A9A] mb-2 font-semibold";

  const handleSaveTemplate = async () => {
    if (!user?.id || !businessName) return;
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/invoices/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          templateName: templateName || "My Template",
          businessName,
          businessAddress,
          businessPhone,
          businessEmail,
          businessLogo,
          defaultCurrency: currency,
          defaultTaxRate: taxRate,
          defaultTerms: terms,
          defaultNotes: notes,
          isDefault: templates.length === 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveAsTemplate(false);
        setTemplateName("");
        fetchTemplates();
        alert("Template saved!");
      }
    } catch (e) {
      alert("Failed to save template");
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleCreate = async () => {
    if (!user?.id) {
      alert("You must be logged in.");
      return;
    }
    if (!customerName || items.some((i) => !i.itemName || !i.unitPrice)) {
      alert("Fill in all required fields and item details.");
      return;
    }
    if (isRecurring && !recurringEndDate) {
      alert("Please set an end date for recurring invoices.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          invoiceNumber,
          issueDate,
          dueDate: dueDate || issueDate,
          currency,
          businessName,
          businessAddress,
          businessPhone,
          businessEmail,
          businessLogo,
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          subtotal: subtotal.toFixed(2),
          taxRate,
          taxAmount: taxAmount.toFixed(2),
          discount: discountAmount.toFixed(2),
          total: total.toFixed(2),
          balanceDue: total.toFixed(2),
          notes,
          terms,
          isRecurring,
          recurringFrequency: isRecurring ? recurringFrequency : null,
          recurringEndDate: isRecurring ? recurringEndDate : null,
          items: items.map((i) => ({
            itemName: i.itemName,
            description: i.description,
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice).toFixed(2),
            totalPrice: (Number(i.unitPrice) * i.quantity).toFixed(2),
            imageUrl: i.imageUrl,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (saveAsTemplate && templateName) await handleSaveTemplate();
        router.push(`/invoice/${data.invoice.id}`);
      } else {
        alert(data.error || "Failed to create invoice");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F0E6] font-[Inter,sans-serif]">
      <div className="border-b border-[#2A2A3E] px-6 py-5 flex items-center justify-between sticky top-0 bg-[#0A0A0F]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/invoices" className="text-[#8A8A9A] hover:text-[#D4AF37] transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Crown className="w-6 h-6 text-[#D4AF37]" />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>
              INVOICE FORGE
            </h1>
            <p className="text-[10px] text-[#5A5A6A]">Create a professional invoice</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-8 h-1 rounded-full transition-all ${step >= s ? "bg-[#D4AF37]" : "bg-[#2A2A3E]"}`} />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* STEP 1: BUSINESS & CUSTOMER */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            {/* Template Selector */}
            {templates.length > 0 && (
              <div className="bg-[#14141E] border border-[#2A2A3E] rounded-xl p-4">
                <label className={labelBase}>Load Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => loadTemplate(e.target.value)}
                  className={inputBase}
                >
                  <option value="" className="bg-[#0A0A0F]">— Select a saved template —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#0A0A0F]">{t.templateName} {t.isDefault ? "(Default)" : ""}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* BUSINESS */}
              <div className="bg-[#14141E] border border-[#2A2A3E] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-[#D4AF37] mb-6 flex items-center gap-2" style={{ fontFamily: "Cinzel, serif" }}>
                  <Crown className="w-4 h-4" /> Your Business
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelBase}>Business Name *</label>
                    <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Crown Benz Ltd" className={inputBase} />
                  </div>
                  <div>
                    <label className={labelBase}>Business Logo</label>
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-[#2A2A3E] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37]/50 transition-colors bg-[#0A0A0F]"
                    >
                      {businessLogo ? (
                        <img src={businessLogo} alt="Logo" className="h-20 object-contain" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-[#5A5A6A] mb-1" />
                          <span className="text-xs text-[#5A5A6A]">Click to upload logo</span>
                        </>
                      )}
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </div>
                  <div>
                    <label className={labelBase}>Address</label>
                    <textarea value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="123 Business Street, Accra, Ghana" rows={2} className={`${inputBase} resize-none`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}>Phone</label>
                      <input type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="+233 20 000 0000" className={inputBase} />
                    </div>
                    <div>
                      <label className={labelBase}>Email</label>
                      <input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="hello@crownbenz.com" className={inputBase} />
                    </div>
                  </div>
                </div>
              </div>

              {/* CUSTOMER */}
              <div className="bg-[#14141E] border border-[#2A2A3E] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-[#D4AF37] mb-6 flex items-center gap-2" style={{ fontFamily: "Cinzel, serif" }}>
                  <Sparkles className="w-4 h-4" /> Bill To
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelBase}>Customer Name *</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Mensah" className={inputBase} />
                  </div>
                  <div>
                    <label className={labelBase}>Address</label>
                    <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="456 Client Avenue, Lagos, Nigeria" rows={2} className={`${inputBase} resize-none`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelBase}>Phone</label>
                      <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+234 80 000 0000" className={inputBase} />
                    </div>
                    <div>
                      <label className={labelBase}>Email</label>
                      <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="john@client.com" className={inputBase} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => router.push("/dashboard/invoices")} className="flex-1 py-3.5 border border-[#2A2A3E] text-[#8A8A9A] rounded-lg text-sm font-semibold hover:bg-[#1E1E2A] transition-colors">
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!businessName || !customerName}
                className="flex-1 py-3.5 bg-[#D4AF37] text-[#0A0A0F] font-bold text-sm rounded-lg hover:bg-[#C4A030] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ITEMS */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>
                Line Items
              </h2>
              <div className="flex items-center gap-3">
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${inputBase} w-auto py-2 text-xs`}>
                  {currencies.map((c) => (
                    <option key={c.value} value={c.value} className="bg-[#0A0A0F]">{c.label}</option>
                  ))}
                </select>
                <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-2 bg-[#046307]/15 text-[#046307] rounded-lg text-xs font-bold hover:bg-[#046307]/25 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={item.id} className="bg-[#14141E] border border-[#2A2A3E] rounded-xl p-5 relative">
                  <div className="absolute top-3 right-3">
                    <button onClick={() => removeItem(item.id)} className="text-[#8B0000] hover:text-[#8B0000]/70 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <label className={labelBase}>Item Name *</label>
                      <input type="text" value={item.itemName} onChange={(e) => updateItem(item.id, "itemName", e.target.value)} placeholder="e.g., W213 E63 AMG Side Mirror" className={inputBase} />
                    </div>
                    <div className="md:col-span-4">
                      <label className={labelBase}>Description</label>
                      <input type="text" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Left hand side, OEM" className={inputBase} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelBase}>Qty</label>
                      <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)} className={inputBase} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelBase}>Unit Price *</label>
                      <input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)} placeholder="0.00" className={inputBase} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-xs text-[#8A8A9A] cursor-pointer hover:border-[#D4AF37]/50 transition-colors">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {item.imageUrl ? "Change Image" : "Add Item Image"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleItemImageUpload(item.id, e)} />
                    </label>
                    {item.imageUrl && (
                      <div className="flex items-center gap-2">
                        <img src={item.imageUrl} alt="" className="h-8 w-8 rounded object-cover border border-[#2A2A3E]" />
                        <button onClick={() => updateItem(item.id, "imageUrl", "")} className="text-[#8B0000] text-xs hover:underline">Remove</button>
                      </div>
                    )}
                    <div className="ml-auto text-sm font-bold text-[#D4AF37]">
                      {(Number(item.unitPrice || 0) * item.quantity).toLocaleString()} {currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 border border-[#2A2A3E] text-[#8A8A9A] rounded-lg text-sm font-semibold hover:bg-[#1E1E2A] transition-colors">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={items.some((i) => !i.itemName || !i.unitPrice)}
                className="flex-1 py-3.5 bg-[#D4AF37] text-[#0A0A0F] font-bold text-sm rounded-lg hover:bg-[#C4A030] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TOTALS & PREVIEW */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg font-bold text-[#D4AF37]" style={{ fontFamily: "Cinzel, serif" }}>
              Finalize & Totals
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={labelBase}>Invoice #</label>
                <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Issue Date</label>
                <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Due Date *</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputBase} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={labelBase}>Tax Rate (%)</label>
                <input type="number" min="0" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Discount ({currency})</label>
                <input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} className={inputBase} />
              </div>
            </div>

            {/* RECURRING TOGGLE */}
            <div className="bg-[#14141E] border border-[#2A2A3E] rounded-xl p-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-colors relative ${isRecurring ? "bg-[#D4AF37]" : "bg-[#2A2A3E]"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isRecurring ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <input type="checkbox" className="hidden" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-[#F5F0E6]">Recurring Invoice</span>
                </div>
              </label>

              {isRecurring && (
                <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#2A2A3E]">
                  <div>
                    <label className={labelBase}>Frequency</label>
                    <select value={recurringFrequency} onChange={(e) => setRecurringFrequency(e.target.value)} className={inputBase}>
                      {frequencies.map((f) => (
                        <option key={f.value} value={f.value} className="bg-[#0A0A0F]">{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelBase}>End Date *</label>
                    <input type="date" value={recurringEndDate} onChange={(e) => setRecurringEndDate(e.target.value)} className={inputBase} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={labelBase}>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Thank you for your business..." rows={2} className={`${inputBase} resize-none`} />
            </div>
            <div>
              <label className={labelBase}>Terms & Conditions</label>
              <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={2} className={`${inputBase} resize-none`} />
            </div>

            {/* Save as Template */}
            <div className="bg-[#14141E] border border-[#2A2A3E] rounded-xl p-5">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <div className={`w-10 h-6 rounded-full transition-colors relative ${saveAsTemplate ? "bg-[#D4AF37]" : "bg-[#2A2A3E]"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${saveAsTemplate ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <input type="checkbox" className="hidden" checked={saveAsTemplate} onChange={(e) => setSaveAsTemplate(e.target.checked)} />
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-[#F5F0E6]">Save as Template for future invoices</span>
                </div>
              </label>
              {saveAsTemplate && (
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name (e.g., Crown Benz Default)"
                  className={inputBase}
                />
              )}
            </div>

            {/* Live Totals */}
            <div className="bg-[#14141E] border border-[#2A2A3E] rounded-xl p-6">
              <div className="space-y-3 max-w-sm ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A9A]">Subtotal</span>
                  <span className="text-[#F5F0E6] font-bold">{subtotal.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A9A]">Tax ({taxRate}%)</span>
                  <span className="text-[#F5F0E6] font-bold">{taxAmount.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A9A]">Discount</span>
                  <span className="text-[#8B0000] font-bold">−{discountAmount.toLocaleString()} {currency}</span>
                </div>
                <div className="border-t border-[#2A2A3E] pt-3 flex justify-between">
                  <span className="text-[#8A8A9A] font-bold">TOTAL</span>
                  <span className="text-[#D4AF37] text-xl font-bold" style={{ fontFamily: "Cinzel, serif" }}>
                    {total.toLocaleString()} {currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 border border-[#2A2A3E] text-[#8A8A9A] rounded-lg text-sm font-semibold hover:bg-[#1E1E2A] transition-colors">
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !dueDate}
                className="flex-1 py-3.5 bg-[#D4AF37] text-[#0A0A0F] font-bold text-sm rounded-lg hover:bg-[#C4A030] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Sparkles className="w-4 h-4" /> Forge Invoice</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}