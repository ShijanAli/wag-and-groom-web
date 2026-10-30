"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DataTable, DataTableToolbar, TableTabs } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useListParams } from "@/hooks/use-list-params";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { SUBSCRIPTION_STATUS_OPTIONS, downloadSubscribersCsv, subscriberHooks } from "@/features/content/api";
import type { NewsletterSubscriber } from "@/types/models";

export default function AdminNewsletter() {
  const list = useListParams({ defaults: { status: "subscribed", sortBy: "subscribedAt", sortOrder: "desc" } });
  const query = subscriberHooks.useList(list.params);
  const [exporting, setExporting] = useState(false);

  const columns = useMemo<ColumnDef<NewsletterSubscriber>[]>(
    () => [
      { id: "email", header: "Email", enableSorting: true, cell: ({ row }) => <span className="font-medium">{row.original.email}</span> },
      { id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { id: "subscribedAt", header: "Subscribed", enableSorting: true, cell: ({ row }) => formatDate(row.original.subscribedAt) },
      { id: "unsubscribedAt", header: "Unsubscribed", cell: ({ row }) => formatDate(row.original.unsubscribedAt) },
    ],
    [],
  );

  const exportCsv = async () => {
    setExporting(true);
    try {
      await downloadSubscribersCsv({ status: list.params.status });
    } catch (e) {
      toast.error(getErrorMessage(e, "Export failed"));
    } finally {
      setExporting(false);
    }
  };

  const total = query.data?.meta.total;

  return (
    <>
      <PageHeader
        title="Newsletter"
        description={total !== undefined ? `${total.toLocaleString("en-IN")} ${list.params.status === "unsubscribed" ? "unsubscribed" : list.params.status ? "active subscribers" : "emails"}` : "People who signed up in the website footer."}
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={exporting || !total}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />} Export CSV
          </Button>
        }
      />
      <DataTable
        columns={columns}
        query={query}
        list={list}
        emptyTitle="No subscribers yet"
        emptyDescription="The footer signup form on every public page feeds this list."
        toolbar={
          <div className="space-y-3">
            <TableTabs list={list} options={SUBSCRIPTION_STATUS_OPTIONS} />
            <DataTableToolbar list={list} defaults={{ status: "subscribed" }} searchPlaceholder="Search email…" />
          </div>
        }
      />
    </>
  );
}
