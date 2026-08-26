"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Crown, Printer, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import SignatureCanvas from "@/components/SignatureCanvas";

export default function ContractView() {
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signatureData, setSignatureData] = useState("");

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      const res = await fetch(`/api/contracts/${contractId}`);
      const data = await res.json();
      if (data.contract) {
        setContract(data.contract);
        if (data.contract.status === "signed") setSigned(true);
      } else {
        setError("Contract not found");
      }
    } catch (e) {
      setError("Failed to load contract");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signatureData) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureData }),
      });
      const data = await res.json();
      if (data.success) {
        setSigned(true);
        setContract(data.contract);
      }
    } catch (e) {
      alert("Failed to sign contract");
    } finally {
      setSigning(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 32, height: 32, color: "#D4AF37", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B0000" }}>
        <AlertCircle style={{ width: 24, height: 24, marginRight: 8 }} /> {error || "Contract not found"}
      </div>
    );
  }

  const depositAmount = (Number(contract.total_fee) * (contract.deposit_percent / 100)).toFixed(2);
  const finalAmount = (Number(contract.total_fee) - Number(depositAmount)).toFixed(2);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#F5F0E6", fontFamily: "Inter, sans-serif", paddingBottom: 64 }}>
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .contract-paper { background: #fff !important; color: #000 !important; padding: 48px !important; }
          .contract-paper * { color: #000 !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ textAlign: "center", padding: "32px 24px", borderBottom: "1px solid #2A2A3E" }}>
        <Crown style={{ color: "#D4AF37", width: 32, height: 32, margin: "0 auto 12px" }} />
        <h1 style={{ fontFamily: "Cinzel, serif", color: "#D4AF37", fontSize: "20px", margin: 0 }}>CROWN BENZ</h1>
        <p style={{ color: "#8A8A9A", fontSize: "12px" }}>Service Agreement</p>
      </div>

      {/* Contract Document */}
      <div className="contract-paper" style={{ maxWidth: 800, margin: "32px auto", padding: "0 24px" }}>
        {/* Title Block */}
        <div style={{ textAlign: "center", marginBottom: "40px", paddingBottom: "24px", borderBottom: "2px solid #D4AF37" }}>
          <h2 style={{ fontFamily: "Cinzel, serif", fontSize: "24px", color: "#D4AF37", margin: "0 0 8px" }}>
            SERVICE AGREEMENT
          </h2>
          <p style={{ color: "#8A8A9A", fontSize: "13px", margin: 0 }}>
            Contract No: <strong style={{ color: "#D4AF37" }}>{contract.contract_number}</strong>
          </p>
          <p style={{ color: "#5A5A6A", fontSize: "11px", marginTop: "4px" }}>
            Generated: {new Date(contract.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Client Info */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#D4AF37", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Client Information
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "14px" }}>
            <div>
              <span style={{ color: "#8A8A9A", fontSize: "11px", textTransform: "uppercase" }}>Full Name</span>
              <p style={{ margin: "4px 0 0", color: "#F5F0E6" }}>{contract.client_name}</p>
            </div>
            <div>
              <span style={{ color: "#8A8A9A", fontSize: "11px", textTransform: "uppercase" }}>Email</span>
              <p style={{ margin: "4px 0 0", color: "#F5F0E6" }}>{contract.client_email}</p>
            </div>
            <div>
              <span style={{ color: "#8A8A9A", fontSize: "11px", textTransform: "uppercase" }}>Phone</span>
              <p style={{ margin: "4px 0 0", color: "#F5F0E6" }}>{contract.client_phone || "N/A"}</p>
            </div>
            <div>
              <span style={{ color: "#8A8A9A", fontSize: "11px", textTransform: "uppercase" }}>Business</span>
              <p style={{ margin: "4px 0 0", color: "#F5F0E6" }}>{contract.business_name || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#D4AF37", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Service Details
          </h3>
          <div style={{ fontSize: "14px", lineHeight: 1.6 }}>
            <div style={{ marginBottom: "12px" }}>
              <span style={{ color: "#8A8A9A", fontSize: "11px", textTransform: "uppercase" }}>Service Type</span>
              <p style={{ margin: "4px 0 0", color: "#F5F0E6" }}>{contract.service_type}</p>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <span style={{ color: "#8A8A9A", fontSize: "11px", textTransform: "uppercase" }}>Project Description</span>
              <p style={{ margin: "4px 0 0", color: "#F5F0E6", whiteSpace: "pre-wrap" }}>{contract.project_description}</p>
            </div>
            {contract.deliverables && (
              <div style={{ marginBottom: "12px" }}>
                <span style={{ color: "#8A8A9A", fontSize: "11px", textTransform: "uppercase" }}>Deliverables</span>
                <p style={{ margin: "4px 0 0", color: "#F5F0E6", whiteSpace: "pre-wrap" }}>{contract.deliverables}</p>
              </div>
            )}
            {contract.timeline && (
              <div>
                <span style={{ color: "#8A8A9A", fontSize: "11px", textTransform: "uppercase" }}>Timeline</span>
                <p style={{ margin: "4px 0 0", color: "#F5F0E6" }}>{contract.timeline}</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Terms */}
        <div style={{ marginBottom: "32px", background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: "8px", padding: "24px" }}>
          <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#D4AF37", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Financial Terms
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", fontSize: "14px" }}>
            <div style={{ textAlign: "center", padding: "12px", background: "rgba(20,20,30,0.4)", borderRadius: "6px" }}>
              <p style={{ color: "#8A8A9A", fontSize: "11px", margin: "0 0 4px" }}>TOTAL FEE</p>
              <p style={{ color: "#D4AF37", fontSize: "20px", fontWeight: "bold", margin: 0 }}>GH₵{Number(contract.total_fee).toFixed(2)}</p>
            </div>
            <div style={{ textAlign: "center", padding: "12px", background: "rgba(4,99,7,0.1)", borderRadius: "6px", border: "1px solid rgba(4,99,7,0.2)" }}>
              <p style={{ color: "#8A8A9A", fontSize: "11px", margin: "0 0 4px" }}>DEPOSIT ({contract.deposit_percent}%)</p>
              <p style={{ color: "#046307", fontSize: "20px", fontWeight: "bold", margin: 0 }}>GH₵{depositAmount}</p>
            </div>
            <div style={{ textAlign: "center", padding: "12px", background: "rgba(20,20,30,0.4)", borderRadius: "6px" }}>
              <p style={{ color: "#8A8A9A", fontSize: "11px", margin: "0 0 4px" }}>FINAL PAYMENT</p>
              <p style={{ color: "#F5F0E6", fontSize: "20px", fontWeight: "bold", margin: 0 }}>GH₵{finalAmount}</p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#D4AF37", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Terms & Conditions
          </h3>
          <ol style={{ fontSize: "13px", lineHeight: 1.8, color: "#8A8A9A", paddingLeft: "20px" }}>
            <li>Work begins only after the deposit is received and cleared.</li>
            <li>No revisions are included after final delivery unless specified in writing and paid separately.</li>
            <li>All source code, design files, and deliverables remain the property of <strong style={{ color: "#F5F0E6" }}>Nwankwo Moses Ezechukwu (Crown Benz)</strong> until final payment is cleared in full.</li>
            <li>Cancellation by client: deposit is forfeited. Cancellation by provider: deposit returned within 7 business days.</li>
            <li>Late payment fee: <strong style={{ color: "#F5F0E6" }}>10% per week</strong> after the agreed deadline.</li>
            <li>Any disputes shall be resolved in Accra, Ghana under Ghanaian law.</li>
          </ol>
          <p style={{ fontSize: "12px", color: "#8B0000", marginTop: "16px", fontWeight: "bold", textAlign: "center", fontStyle: "italic" }}>
            "NO DOCUMENT. NO WORK. NO EXCEPTIONS."
          </p>
        </div>

        {/* Signature Section */}
        <div style={{ marginBottom: "40px", pageBreakInside: "avoid" }}>
          <h3 style={{ fontFamily: "Cinzel, serif", fontSize: "14px", color: "#D4AF37", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Signatures
          </h3>

          {signed ? (
            <div style={{ textAlign: "center", padding: "32px", background: "rgba(4,99,7,0.05)", border: "2px solid #046307", borderRadius: "12px" }}>
              <CheckCircle style={{ width: 48, height: 48, color: "#046307", marginBottom: "12px" }} />
              <h4 style={{ color: "#046307", fontSize: "18px", margin: "0 0 8px" }}>Contract Signed</h4>
              <p style={{ color: "#8A8A9A", fontSize: "13px", margin: 0 }}>
                Signed on {contract.signed_at ? new Date(contract.signed_at).toLocaleString("en-US") : "N/A"}
              </p>
              {contract.signature_data && (
                <img src={contract.signature_data} alt="Client signature" style={{ marginTop: "16px", maxWidth: 300, border: "1px solid #2A2A3E", borderRadius: "4px" }} />
              )}
            </div>
          ) : (
            <div className="no-print">
              <div style={{ background: "rgba(20,20,30,0.4)", border: "1px solid #2A2A3E", borderRadius: "8px", padding: "24px" }}>
                <p style={{ color: "#8A8A9A", fontSize: "13px", marginBottom: "16px" }}>
                  By signing below, you agree to all terms and conditions stated in this agreement.
                </p>
                <SignatureCanvas onSave={setSignatureData} width={500} height={150} />
                {signatureData && (
                  <button
                    onClick={handleSign}
                    disabled={signing}
                    style={{
                      marginTop: "16px",
                      width: "100%",
                      padding: "14px",
                      background: signing ? "#2A2A3E" : "#046307",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      cursor: signing ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {signing ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Processing...</> : <><CheckCircle style={{ width: 16, height: 16 }} /> Sign Contract Electronically</>}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Provider Signature */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #2A2A3E" }}>
          <div>
            <p style={{ color: "#8A8A9A", fontSize: "11px", textTransform: "uppercase", marginBottom: "8px" }}>Client Signature</p>
            <div style={{ height: 60, borderBottom: "1px solid #D4AF37" }}>
              {contract.signature_data && <img src={contract.signature_data} alt="" style={{ height: 58, maxWidth: "100%" }} />}
            </div>
            <p style={{ color: "#F5F0E6", fontSize: "13px", marginTop: "8px" }}>{contract.client_name}</p>
            <p style={{ color: "#5A5A6A", fontSize: "11px" }}>{contract.signed_at ? new Date(contract.signed_at).toLocaleDateString() : "Pending"}</p>
          </div>
          <div>
            <p style={{ color: "#8A8A9A", fontSize: "11px", textTransform: "uppercase", marginBottom: "8px" }}>Provider</p>
            <div style={{ height: 60, borderBottom: "1px solid #D4AF37" }} />
            <p style={{ color: "#F5F0E6", fontSize: "13px", marginTop: "8px" }}>Nwankwo Moses Ezechukwu</p>
            <p style={{ color: "#5A5A6A", fontSize: "11px" }}>Crown Benz</p>
          </div>
        </div>
      </div>

      {/* Floating Actions */}
      <div className="no-print" style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          onClick={handlePrint}
          style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "#D4AF37", color: "#0A0A0F",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
          title="Print / Save as PDF"
        >
          <Printer style={{ width: 24, height: 24 }} />
        </button>
      </div>
    </div>
  );
}