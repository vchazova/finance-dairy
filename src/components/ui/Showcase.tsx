"use client";
import * as React from "react";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  DatePicker,
  DateRangePicker,
  Drawer,
  H1,
  H2,
  IconButton,
  Input,
  Modal,
  MultiSelect,
  NumberInput,
  Pagination,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  TextArea,
  ToastContainer,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  type ToastProps,
  AppLayout,
  WorkspaceLayout,
  PageHeader,
  PageContent,
  FormSection,
  SplitPane,
} from "@/components/ui";
import {
  Eye,
  Pencil,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <H2>{title}</H2>
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        {children}
      </div>
    </section>
  );
}

function ColorSwatch({
  name,
  varName,
  description,
}: {
  name: string;
  varName: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="h-10 w-10 rounded-xl border border-[hsl(var(--border))]"
        style={{ backgroundColor: `hsl(var(${varName}))` }}
      />
      <div className="text-sm space-y-0.5">
        <div className="font-medium text-[hsl(var(--fg))]">{name}</div>
        <div className="text-[hsl(var(--fg-muted))]">{varName}</div>
        {description && (
          <div className="text-[hsl(var(--fg-muted))]">{description}</div>
        )}
      </div>
    </div>
  );
}

function ThemeToggleInline() {
  const [theme, setTheme] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    const current =
      document.documentElement.getAttribute("data-theme") || undefined;
    setTheme(current);
  }, []);
  function toggle() {
    const root = document.documentElement;
    const isDark = root.getAttribute("data-theme") === "dark";
    if (isDark) {
      root.removeAttribute("data-theme");
      setTheme(undefined);
    } else {
      root.setAttribute("data-theme", "dark");
      setTheme("dark");
    }
  }
  return (
    <Button
      variant="default"
      onClick={toggle}
      className="border-[hsl(var(--border))]"
    >
      Theme: {theme === "dark" ? "Dark" : "Light"}
    </Button>
  );
}

export default function UIShowcase() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState("transactions");
  const [tablePage, setTablePage] = React.useState(1);
  const [tableLoading, setTableLoading] = React.useState(false);
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const tableData = React.useMemo(
    () => [
      {
        id: "TX-1201",
        name: "Workspace subscription",
        amount: "$320",
        status: "Completed",
        owner: "Elena Petrova",
      },
      {
        id: "TX-1202",
        name: "Team bonuses",
        amount: "$980",
        status: "Processing",
        owner: "Maxim Lebedev",
      },
      {
        id: "TX-1203",
        name: "AWS credits",
        amount: "$150",
        status: "Completed",
        owner: "Olga Alexeeva",
      },
      {
        id: "TX-1204",
        name: "Office rent",
        amount: "$2,150",
        status: "Scheduled",
        owner: "Finance HQ",
      },
      {
        id: "TX-1205",
        name: "Hardware upgrade",
        amount: "$4,200",
        status: "Draft",
        owner: "Kirill Morozov",
      },
    ],
    []
  );

  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(tableData.length / pageSize));
  const pagedRows = tableData.slice(
    (tablePage - 1) * pageSize,
    tablePage * pageSize
  );

  const statusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Processing":
        return "primary";
      case "Scheduled":
        return "warning";
      case "Draft":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const pushToast = React.useCallback((toast: ToastProps) => {
    const id = `${Date.now()}-${Math.random()}`;
    const nextToast = { ...toast, id };
    setToasts((prev) => [...prev, nextToast]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const simulateTableLoading = React.useCallback(() => {
    setTableLoading(true);
    setTimeout(() => setTableLoading(false), 1800);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 text-[hsl(var(--fg))] md:p-10">
      <ToastContainer toasts={toasts} />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <H1>UI-kit Showcase</H1>
          <Text>Components and color tokens (light/dark on CSS variables).</Text>
        </div>
        <ThemeToggleInline />
      </header>

      <Section title="Color tokens">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Background",
              varName: "--bg",
              description: "Page background",
            },
            { name: "Card", varName: "--card", description: "Surfaces" },
            { name: "Border", varName: "--border", description: "Dividers" },
            { name: "Foreground", varName: "--fg", description: "Primary text" },
            {
              name: "Foreground Muted",
              varName: "--fg-muted",
              description: "Secondary text",
            },
            {
              name: "Primary",
              varName: "--color-primary",
              description: "Main accent",
            },
            {
              name: "Primary FG",
              varName: "--color-primary-fg",
              description: "Text on primary",
            },
            {
              name: "Secondary",
              varName: "--color-secondary",
              description: "Soft backgrounds",
            },
            {
              name: "Secondary FG",
              varName: "--color-secondary-fg",
              description: "Text on secondary",
            },
            { name: "Info", varName: "--color-info", description: "Info" },
            {
              name: "Success",
              varName: "--color-success",
              description: "Positive state",
            },
            {
              name: "Warning",
              varName: "--color-warning",
              description: "Attention",
            },
            {
              name: "Danger",
              varName: "--color-danger",
              description: "Errors",
            },
          ].map((c) => (
            <ColorSwatch key={c.varName} {...c} />
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-2">
          <H1>H1 — Main heading for screens</H1>
          <H2>H2 — Section heading with hierarchy</H2>
          <Text>
            Body text uses <code>--fg</code> for the default color and{" "}
            <span className="text-[hsl(var(--fg-muted))]">muted</span> for
            secondary information.
          </Text>
        </div>
      </Section>

      <Section title="Cards & layouts">
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            title="Monthly limits"
            description="Control how much teams can spend across categories."
            footer={<Button size="sm">Review limits</Button>}
          >
            <div className="flex items-center justify-between rounded-2xl bg-black/5 px-4 py-3">
              <div>
                <p className="text-sm text-[hsl(var(--fg-muted))]">Marketing</p>
                <p className="text-lg font-semibold">$4,200 / $6,000</p>
              </div>
              <span className="text-sm text-[hsl(var(--fg-muted))]">70%</span>
            </div>
          </Card>
          <Card title="Workspace onboarding" padding="sm">
            <div className="space-y-3">
              <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--fg-muted))]">
                Drag & drop files, connect cards, invite teammates.
              </div>
              <Button variant="primary" fullWidth>
                Get started
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Loading states (skeletons & spinners)">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Button
              variant="primary"
              leftIcon={<Spinner size="sm" />}
              disabled
            >
              Saving…
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Buttons: variants and sizes">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="default">Default</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="default" disabled>
            Disabled
          </Button>
          <Button variant="primary" className="w-40" fullWidth>
            Full width
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <IconButton variant="primary" aria-label="Add">
            <Plus className="h-4 w-4" />
          </IconButton>
          <IconButton variant="ghost" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton variant="danger" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </IconButton>
          <IconButton variant="secondary" aria-label="Settings">
            <Settings2 className="h-4 w-4" />
          </IconButton>
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs value={tabValue} onChange={setTabValue}>
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="workspace">Workspace settings</TabsTrigger>
            <TabsTrigger value="dictionaries">Dictionaries</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <Text>
              Use tabs for quick switches between data views such as “Transactions” and “Settings”.
            </Text>
          </TabsContent>
          <TabsContent value="workspace">
            <Text>
              Group workspace controls: General, Members, Dictionaries – each gets its own tab content.
            </Text>
          </TabsContent>
          <TabsContent value="dictionaries">
            <Text>
              Inside dictionaries you can even nest sub-tabs for categories, accounts and more.
            </Text>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Avatars, badges & tooltips">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name="Nikita Glazkov" />
          <Avatar name="Kseniya Petrova" size="sm" />
          <Avatar name="Finance HQ" size="lg" />
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="primary">Owner</Badge>
            </TooltipTrigger>
            <TooltipContent>
              Workspace owner role. Full access to billing and billing limits.
            </TooltipContent>
          </Tooltip>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="danger">Overdue</Badge>
        </div>
      </Section>

      <Section title="Form fields and states">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" placeholder="Enter name" />
          <Input label="Email" type="email" placeholder="user@example.com" />
          <NumberInput label="Amount" placeholder="0.00" step="0.01" />
          <DatePicker label="Date" />
          <TextArea label="Comment" placeholder="A couple words…" />
          <Select
            label="Role"
            options={[
              { value: "", label: "—" },
              { value: "admin", label: "Admin" },
              { value: "user", label: "User" },
            ]}
          />
          <MultiSelect
            label="Tags"
            options={[
              { value: "food", label: "Food" },
              { value: "travel", label: "Travel" },
              { value: "other", label: "Other" },
            ]}
            hint="Multiple choice"
          />
          <Input
            label="With error"
            placeholder="Not right…"
            error="Field is required"
          />
          <Input label="Disabled" placeholder="Unavailable" disabled />
          <DateRangePicker
            label="Date range"
            startLabel="From"
            endLabel="To"
            hint="Select a period for filters"
          />
          <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 md:col-span-2">
            <Checkbox label="Archive" description="Hide from active lists" />
            <Checkbox
              label="Flagged"
              description="Enabled by default"
              defaultChecked
            />
            <Switch label="Active" description="Instantly usable" />
            <Switch label="Public" defaultChecked />
          </div>
        </div>
      </Section>

      <Section title="Side panel (drawer)">
        <Button variant="ghost" onClick={() => setDrawerOpen(true)}>
          Open side panel
        </Button>
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Edit workspace"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setDrawerOpen(false)}>
                Save changes
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input label="Workspace name" placeholder="Finance HQ" />
            <TextArea label="About" placeholder="Purpose, owners, notes" />
          </div>
        </Drawer>
      </Section>

      <Section title="Modal">
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          Open modal
        </Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Basic modal"
          footer={
            <div className="flex justify-end gap-2">
              <Button onClick={() => setModalOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)} variant="primary">
                Save
              </Button>
            </div>
          }
        >
          <Text>
            Close with ESC or the buttons; focus stays inside the dialog. Place
            any content inside the modal card.
          </Text>
        </Modal>
      </Section>

      <Section title="Alerts & banners">
        <div className="grid gap-4 md:grid-cols-2">
          <Alert
            variant="info"
            title="Syncing workspace..."
            description="We are refreshing data from connected banks."
            action={<Button size="sm">Details</Button>}
          />
          <Alert
            variant="success"
            title="Settings saved"
            description="New limits will be active within 5 minutes."
          />
          <Alert
            variant="warning"
            title="2 members pending"
            description="Invite links are expiring soon."
            action={<Button size="sm" variant="ghost">Remind</Button>}
          />
          <Alert
            variant="danger"
            title="Failed to load transactions"
            description="Retry or check your connection."
            action={<Button size="sm">Retry</Button>}
          />
        </div>
      </Section>

      <Section title="Table, dropdown menu & pagination">
        <div className="mb-3 flex items-center justify-between">
          <Text className="text-sm text-[hsl(var(--fg-muted))]">
            Demonstrates table rows, dropdown menu, avatars & badges.
          </Text>
          <Button size="sm" variant="ghost" onClick={simulateTableLoading}>
            Simulate loading
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>ID</TableCell>
              <TableCell header>Recipient</TableCell>
              <TableCell header>Amount</TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {[...Array(5)].map((__, idx) => (
                    <TableCell key={idx}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : pagedRows.length > 0 ? (
              pagedRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={row.owner} size="sm" />
                      <div>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-[hsl(var(--fg-muted))]">
                          {row.owner}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(row.status)}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconButton
                        variant="ghost"
                        aria-label="Open"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        aria-label="Edit"
                        size="sm"
                      >
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      <IconButton variant="danger" aria-label="Delete" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <TableEmptyState
                    title="No transactions"
                    description="Try changing dates or adding a new record."
                    action={<Button size="sm">Add transaction</Button>}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex items-center justify-end">
          <Pagination
            page={tablePage}
            totalPages={totalPages}
            onChange={(p) => {
              setTablePage(p);
              setTableLoading(false);
            }}
          />
        </div>
      </Section>

      <Section title="Toasts">
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="primary"
            onClick={() =>
              pushToast({
                title: "Transaction added",
                description: "Workspace “Finance HQ”",
              })
            }
          >
            Show toast
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              pushToast({
                title: "Settings saved",
                description: "Members updated successfully",
                variant: "success",
              })
            }
          >
            Success toast
          </Button>
        </div>
      </Section>

      <Section title="Layouts & sections">
        <div className="space-y-6">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <AppLayout
              fullHeight={false}
              header={
                <div className="flex w-full items-center justify-between">
                  <div className="text-lg font-semibold text-[hsl(var(--fg))]">
                    Finance Dairy
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm">
                      Invite
                    </Button>
                    <Avatar name="Nikita Glazkov" size="sm" />
                  </div>
                </div>
              }
            >
              <PageHeader
                title="Dashboard"
                description="Overview of spendings across workspaces."
                actions={
                  <div className="flex gap-2">
                    <Button variant="ghost">Export</Button>
                    <Button variant="primary">New transaction</Button>
                  </div>
                }
              />
              <PageContent className="space-y-4">
                <FormSection
                  title="Quick actions"
                  description="Frequently used tools"
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button variant="primary">Add payment</Button>
                    <Button variant="secondary">Create budget</Button>
                  </div>
                </FormSection>
              </PageContent>
            </AppLayout>
          </div>

          <WorkspaceLayout
            title="Workspace: Finance HQ"
            description="Manage members, limits and connected cards."
            actions={<Button size="sm">Manage access</Button>}
            tabs={
              <div className="flex flex-wrap gap-2">
                {["Overview", "Members", "Dictionaries"].map((tab) => (
                  <Button key={tab} variant="ghost" size="sm">
                    {tab}
                  </Button>
                ))}
              </div>
            }
          >
            <SplitPane
              ratio="1fr 2fr"
              left={
                <div className="space-y-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm">
                  {["General", "Limits", "Notifications", "Automation"].map(
                    (item) => (
                      <div key={item} className="rounded-xl px-3 py-2 hover:bg-black/5">
                        {item}
                      </div>
                    )
                  )}
                </div>
              }
              right={
                <FormSection
                  title="Limits"
                  description="Set monthly limits for categories"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Marketing" defaultValue="$6,000" />
                    <Input label="Travel" defaultValue="$4,000" />
                  </div>
                </FormSection>
              }
            />
          </WorkspaceLayout>
        </div>
      </Section>

      <footer className="pt-4 text-sm text-[hsl(var(--fg-muted))]">
        Theme is driven by CSS variables; tweak tokens as needed.
      </footer>
    </div>
  );
}
