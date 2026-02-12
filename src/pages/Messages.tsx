import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  Inbox,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Tag,
  Users,
  Clock,
  Folder,
  Check,
  X,
  Mail,
  User,
  EyeOff,
  PanelLeftClose,
  PanelLeftOpen,
  List,
  MessageSquareText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StatusFilter = "Open" | "Closed" | "Requires Attention" | "SLA Due";
type Sort = "Newest" | "Oldest" | "Started last" | "Started first" | "Next SLA target";

type ViewItem = { id: string; label: string; color: string };
type ViewGroup = { id: string; title: string; icon: React.ReactNode; items: ViewItem[] };

type Mode = "messages" | "comments";

type Thread = {
  id: string;           // ✅ conversation id
  pageOrUser: string;   // ✅ sender id (later name)
  subject: string;
  preview: string;
  time: string;
  avatarLetter?: string;
  postId?: string;
  commentCount?: number;
};

type ApiConvRow = {
  id: number;
  sender_id: string;
  last_message: string | null;
  last_message_at: string | null;
};

type ApiMsgRow = {
  id: number;
  direction: "incoming" | "outgoing";
  message_text: string | null;
  created_at: string;
};

const sidebarPrimary = [
  { key: "my", label: "My Inbox", icon: <Inbox className="h-4 w-4" /> },
  { key: "assigned", label: "All Assigned", icon: <Users className="h-4 w-4" /> },
  { key: "unassigned", label: "Unassigned", icon: <Inbox className="h-4 w-4" /> },
  { key: "awaiting", label: "All Awaiting Reply", icon: <Clock className="h-4 w-4" /> },
] as const;

const viewGroupsData: ViewGroup[] = [
  { id: "conn", title: "By connections", icon: <Folder className="h-4 w-4 text-white/45" />, items: [] },
  {
    id: "general-inquiry",
    title: "By general inquiry",
    icon: <Tag className="h-4 w-4 text-white/45" />,
    items: [
      { id: "gq", label: "General Question", color: "bg-sky-400" },
      { id: "billing", label: "Billing and Payments", color: "bg-orange-400" },
      { id: "account", label: "Account Management", color: "bg-emerald-400" },
      { id: "feature", label: "Feature Request", color: "bg-purple-400" },
      { id: "feedback", label: "Feedback", color: "bg-rose-400" },
      { id: "bug", label: "Bug Report", color: "bg-yellow-300" },
      { id: "tech", label: "Technical Issue", color: "bg-pink-400" },
    ],
  },
];

const commentThreads: Thread[] = []; // ✅ comments later connect karenge

function Dot({ className }: { className: string }) {
  return <span className={`h-2.5 w-2.5 rounded-full ${className}`} />;
}

function Toggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={[
        "relative inline-flex h-7 w-14 items-center rounded-full transition",
        checked ? "bg-blue-600" : "bg-white/20",
      ].join(" ")}
      aria-pressed={checked}
    >
      <span
        className={[
          "inline-block h-6 w-6 transform rounded-full bg-white transition",
          checked ? "translate-x-7" : "translate-x-1",
        ].join(" ")}
      />
    </button>
  );
}

function SidebarItem({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
        active
          ? "bg-orange-500/12 text-orange-200 border border-orange-500/20"
          : "text-white/70 hover:bg-white/5 border border-transparent",
      ].join(" ")}
    >
      <span
        className={[
          "h-9 w-9 rounded-xl flex items-center justify-center",
          active ? "bg-orange-500/12 text-orange-200" : "bg-white/0 text-white/70",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="font-medium truncate text-[14px]">{label}</span>
    </button>
  );
}

export default function UniboxInbox() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const [sidebarOverlayOpen, setSidebarOverlayOpen] = useState(false);
  const [activePrimary, setActivePrimary] =
    useState<(typeof sidebarPrimary)[number]["key"]>("my");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Open");
  const [sort, setSort] = useState<Sort>("Newest");

  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  const [addViewOpen, setAddViewOpen] = useState(false);
  const [addViewTab, setAddViewTab] = useState<"user" | "tag" | "team">("user");

  const [configOpen, setConfigOpen] = useState(false);
  const [cfgInboxesByTags, setCfgInboxesByTags] = useState(true);
  const [cfgInboxesByConnections, setCfgInboxesByConnections] = useState(true);
  const [cfgMyInboxByDate, setCfgMyInboxByDate] = useState(false);
  const [cfgLoadAllAtStart, setCfgLoadAllAtStart] = useState(false);

  const [hideAvatar, setHideAvatar] = useState(false);
  const [hideSubjectLine, setHideSubjectLine] = useState(false);

  const [viewSearch, setViewSearch] = useState("");
  const [topSearchOpen, setTopSearchOpen] = useState(false);
  const [topSearchQuery, setTopSearchQuery] = useState("");

  const [mode, setMode] = useState<Mode>("messages");

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    viewGroupsData.forEach((g) => (init[g.id] = g.id === "general-inquiry"));
    return init;
  });
  const prevOpenGroupsRef = useRef<Record<string, boolean> | null>(null);

  // ✅ REAL DATA STATES
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMsgRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState("");

  const inboxTitle = useMemo(() => {
    const item = sidebarPrimary.find((x) => x.key === activePrimary);
    return item?.label || "My Inbox";
  }, [activePrimary]);

  const threadsCount = useMemo(() => (mode === "messages" ? threads.length : commentThreads.length), [mode, threads.length]);

  const dropClass = "z-[99999] bg-[#0B1220] border border-white/10 text-white shadow-2xl";

  const filteredGroups = useMemo(() => {
    const q = viewSearch.trim().toLowerCase();
    if (!q) return viewGroupsData;

    return viewGroupsData
      .map((g) => {
        const titleHit = g.title.toLowerCase().includes(q);
        const items = g.items.filter((it) => it.label.toLowerCase().includes(q));
        return titleHit ? g : { ...g, items };
      })
      .filter((g) => g.title.toLowerCase().includes(q) || g.items.length > 0);
  }, [viewSearch]);

  useEffect(() => {
    const q = viewSearch.trim();
    if (q.length > 0) {
      if (!prevOpenGroupsRef.current) prevOpenGroupsRef.current = openGroups;
      const next: Record<string, boolean> = {};
      filteredGroups.forEach((g) => (next[g.id] = true));
      setOpenGroups((p) => ({ ...p, ...next }));
    } else {
      if (prevOpenGroupsRef.current) {
        setOpenGroups(prevOpenGroupsRef.current);
        prevOpenGroupsRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewSearch, filteredGroups]);

  const onSaveConfig = () => setConfigOpen(false);

  async function loadThreads() {
    try {
      setThreadsLoading(true);
      const r = await fetch(`${API_BASE}/api/messenger/threads`);
      const j = await r.json();

      const list: ApiConvRow[] = j?.data || [];
      const mapped: Thread[] = list.map((c) => ({
        id: String(c.id),
        pageOrUser: c.sender_id,
        subject: "Messenger",
        preview: c.last_message || "",
        time: c.last_message_at ? new Date(c.last_message_at).toLocaleString() : "",
      }));

      setThreads(mapped);
    } catch (e) {
      console.error(e);
      setThreads([]);
    } finally {
      setThreadsLoading(false);
    }
  }

  async function openConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setReplyText("");
    try {
      setMessagesLoading(true);
      const r = await fetch(`${API_BASE}/api/messenger/conversation/${conversationId}`);
      const j = await r.json();
      setMessages(j?.data || []);
    } catch (e) {
      console.error(e);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }

  async function sendReply() {
    if (!activeConversationId) return;
    const text = replyText.trim();
    if (!text) return;

    try {
      const r = await fetch(`${API_BASE}/api/messenger/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConversationId, messageText: text }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message || "Send failed");

      setMessages((p) => [
        ...p,
        { id: Date.now(), direction: "outgoing", message_text: text, created_at: new Date().toISOString() },
      ]);

      setThreads((p) =>
        p.map((t) => (t.id === activeConversationId ? { ...t, preview: text, time: new Date().toLocaleString() } : t))
      );

      setReplyText("");
    } catch (e) {
      console.error(e);
      alert("Reply failed. Backend logs check karo.");
    }
  }

  useEffect(() => {
    if (mode !== "messages") return;
    loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const activeThreads = useMemo(() => {
    const base = mode === "messages" ? threads : commentThreads;
    const q = topSearchQuery.trim().toLowerCase();
    if (!q) return base;

    return base.filter((t) => {
      return (
        t.pageOrUser.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q) ||
        (t.postId || "").toLowerCase().includes(q)
      );
    });
  }, [mode, topSearchQuery, threads]);

  return (
    <div className="w-full h-full min-h-0 overflow-hidden bg-[#070A0F] text-white">
      <div className="relative flex h-full min-h-0 overflow-hidden">
        <aside className="w-[72px] shrink-0 bg-black/40 border-r border-white/10 flex flex-col">
          <div className="h-[72px] px-3 flex items-center justify-center border-b border-white/10">
            <span className="text-[18px] font-black tracking-tight text-orange-400">UN</span>
          </div>

          <div className="p-2 space-y-1">
            {sidebarPrimary.map((item) => (
              <button
                key={item.key}
                onClick={() => setActivePrimary(item.key)}
                className={[
                  "w-full h-11 rounded-xl flex items-center justify-center transition border",
                  activePrimary === item.key
                    ? "bg-orange-500/12 text-orange-200 border-orange-500/20"
                    : "text-white/60 hover:bg-white/5 border-transparent",
                ].join(" ")}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
          </div>

          <div className="mt-auto p-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-11 text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
              onClick={() => setSidebarOverlayOpen(true)}
              title="Expand Inbox Sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
          </div>
        </aside>

        {sidebarOverlayOpen && (
          <div className="absolute inset-0 z-50">
            <div className="absolute inset-0 bg-black/55" onClick={() => setSidebarOverlayOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-[360px] bg-[#08101B] border-r border-white/10 shadow-2xl overflow-hidden">
              <div className="h-[72px] px-4 flex items-center justify-between border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[22px] font-black tracking-tight truncate">UNIBOX</span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:bg-white/5"
                    onClick={() => setConfigOpen(true)}
                    title="Configure Default Inboxes"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>

                  <span className="text-orange-400">•</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/5">
                    <Folder className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:bg-white/5"
                    onClick={() => setSidebarOverlayOpen(false)}
                  >
                    <PanelLeftClose className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="h-[calc(100%-72px)] min-h-0 overflow-y-auto">
                <div className="p-3 space-y-1">
                  {sidebarPrimary.map((item) => (
                    <SidebarItem
                      key={item.key}
                      active={activePrimary === item.key}
                      icon={item.icon}
                      label={item.label}
                      onClick={() => setActivePrimary(item.key)}
                    />
                  ))}
                </div>

                <div className="px-3 pt-2 pb-6">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-white/85 font-semibold text-[14px]">My Views</div>
                    {viewSearch.trim() !== "" && (
                      <button className="text-[12px] text-white/50 hover:text-white/80" onClick={() => setViewSearch("")}>
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="relative mb-3">
                    <Input
                      value={viewSearch}
                      onChange={(e) => setViewSearch(e.target.value)}
                      placeholder="Search views..."
                      className="pl-10 bg-black/20 border-white/10 text-[13px] h-10"
                    />
                    <Search className="h-4 w-4 text-white/40 absolute left-3 top-3" />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full justify-center border-dashed border-white/15 bg-black/10 hover:bg-white/5 text-white"
                    onClick={() => setAddViewOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New View
                  </Button>

                  <div className="h-px bg-white/10 my-4" />

                  <div className="space-y-2">
                    {filteredGroups.map((g) => {
                      const isOpen = !!openGroups[g.id];
                      const hasItems = g.items.length > 0;

                      return (
                        <div key={g.id}>
                          <button
                            className="w-full flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-white/5 transition"
                            onClick={() => setOpenGroups((p) => ({ ...p, [g.id]: !p[g.id] }))}
                          >
                            <div className="flex items-center gap-2 text-white/80 min-w-0">
                              {g.icon}
                              <span className="text-[13px] font-medium truncate">{g.title}</span>
                            </div>
                            <span className="text-white/50">
                              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </span>
                          </button>

                          {isOpen && (
                            <div className="mt-1 pl-7 space-y-1">
                              {hasItems ? (
                                g.items.map((it) => (
                                  <button
                                    key={it.id}
                                    onClick={() => setActiveViewId(it.id)}
                                    className={[
                                      "w-full flex items-center gap-2 px-2 py-2 rounded-lg transition text-white/75 hover:bg-white/5",
                                      activeViewId === it.id
                                        ? "bg-orange-500/10 border border-orange-500/20 text-white"
                                        : "border border-transparent",
                                    ].join(" ")}
                                  >
                                    <Dot className={it.color} />
                                    <span className="text-[13px] truncate">{it.label}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="px-2 py-2 text-[12px] text-white/40">No items</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 min-h-0 overflow-hidden bg-[#070A0F]">
          <div className="h-[76px] border-b border-white/10 bg-black/25 flex items-center justify-between px-6">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-[26px] font-extrabold tracking-[-0.02em] truncate">{inboxTitle}</h1>
              <span className="text-white/20">|</span>
              <span className="text-white/55 text-[14px] font-medium">Inbox</span>
            </div>

            <div className="flex items-center gap-2">
              {topSearchOpen && (
                <div className="relative w-[340px]">
                  <Input
                    autoFocus
                    value={topSearchQuery}
                    onChange={(e) => setTopSearchQuery(e.target.value)}
                    placeholder={mode === "messages" ? "Search messages..." : "Search comments / posts..."}
                    className="pl-10 bg-black/20 border-white/10 text-[13px] h-10"
                  />
                  <Search className="h-4 w-4 text-white/40 absolute left-3 top-3" />
                  <button
                    className="absolute right-2 top-2.5 text-white/40 hover:text-white"
                    onClick={() => {
                      setTopSearchQuery("");
                      setTopSearchOpen(false);
                    }}
                    title="Close search"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/5"
                onClick={() => setTopSearchOpen((v) => !v)}
                title="Search"
              >
                <Search className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={`w-[320px] ${dropClass}`}>
                  <DropdownMenuLabel className="text-white/50">Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {["Connection Type", "Status", "Pipeline", "Subject", "Source", "SLA"].map((x) => (
                    <DropdownMenuItem key={x} className="focus:bg-white/5">
                      <span className="text-white/85 text-[13px]">{x}</span>
                      <span className="ml-auto text-white/30">›</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/5">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={`w-[260px] ${dropClass}`}>
                  <DropdownMenuItem
                    className="focus:bg-white/5"
                    onClick={() => {
                      if (mode === "messages") loadThreads();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    <span className="text-[13px]">Reload Inbox</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem
                    className="focus:bg-white/5"
                    onSelect={(e) => {
                      e.preventDefault();
                      setHideAvatar((v) => !v);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="text-[13px]">Hide Avatar</span>
                    <span className="ml-auto">{hideAvatar ? <Check className="h-4 w-4 text-orange-300" /> : null}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="focus:bg-white/5"
                    onSelect={(e) => {
                      e.preventDefault();
                      setHideSubjectLine((v) => !v);
                    }}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    <span className="text-[13px]">Hide Subject Line</span>
                    <span className="ml-auto">
                      {hideSubjectLine ? <Check className="h-4 w-4 text-orange-300" /> : null}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-12 h-[calc(100%-76px)] min-h-0 overflow-hidden">
            <section className="col-span-12 lg:col-span-5 min-h-0 overflow-hidden border-r border-white/10 bg-black/10">
              <div className="h-[62px] px-4 flex items-center justify-between border-b border-white/10 bg-black/10">
                <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                  <TabsList className="bg-black/20 border border-white/10">
                    <TabsTrigger value="messages" className="gap-2">
                      <Mail className="h-4 w-4" /> Messages
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="gap-2">
                      <MessageSquareText className="h-4 w-4" /> Comments
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 text-white font-semibold text-[14px] px-3 py-2 rounded-xl hover:bg-white/5 border border-white/10">
                        <span className="text-white/60">{threadsCount}</span>
                        <span>{statusFilter}</span>
                        <ChevronDown className="h-4 w-4 text-white/50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className={`w-[220px] ${dropClass}`}>
                      {(["Open", "Closed", "Requires Attention", "SLA Due"] as StatusFilter[]).map((s) => (
                        <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)} className="focus:bg-white/5">
                          <span className="text-[13px]">{s}</span>
                          {statusFilter === s && <Check className="h-4 w-4 ml-auto text-orange-300" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 text-white font-semibold rounded-xl px-4 py-2 border border-white/10 hover:bg-white/5 text-[14px]">
                        <span>{sort}</span>
                        <ChevronDown className="h-4 w-4 text-white/50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className={`w-[220px] ${dropClass}`}>
                      {(["Newest", "Oldest", "Started last", "Started first", "Next SLA target"] as Sort[]).map((s) => (
                        <DropdownMenuItem key={s} onClick={() => setSort(s)} className="focus:bg-white/5">
                          <span className="text-[13px]">{s}</span>
                          {sort === s && <Check className="h-4 w-4 ml-auto text-orange-300" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="h-[calc(100%-62px)] min-h-0 overflow-y-auto px-4 py-4">
                {threadsLoading && mode === "messages" && (
                  <div className="text-white/60 text-[13px] mb-3">Loading threads...</div>
                )}

                {activeThreads.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => mode === "messages" && openConversation(t.id)}
                    className="w-full text-left rounded-2xl border border-white/10 bg-black/10 hover:bg-white/5 transition p-4 mb-3"
                  >
                    <div className="flex items-start gap-3">
                      {!hideAvatar && (
                        <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-white/70" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-[15px] truncate">{t.pageOrUser}</div>
                          <div className="flex items-center gap-2">
                            <div className="text-[12px] text-white/40">{t.time}</div>
                          </div>
                        </div>

                        {!hideSubjectLine && (
                          <div className="text-[13px] text-white/80 truncate mt-0.5">{t.subject}</div>
                        )}
                        <div className="text-[12px] text-white/45 truncate mt-1">{t.preview}</div>
                      </div>
                    </div>
                  </button>
                ))}

                {activeThreads.length === 0 && (
                  <div className="px-4 py-10 text-white/70">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl border border-white/10 flex items-center justify-center bg-white/5">
                        <Mail className="h-5 w-5 text-orange-300" />
                      </div>
                      <div className="text-[15px] font-semibold text-white">
                        {topSearchQuery ? "No results found" : "No items to show"}
                      </div>
                    </div>

                    <button
                      className="flex items-center gap-3 text-white/70 hover:text-white transition text-[14px]"
                      onClick={() => setTopSearchOpen(true)}
                    >
                      <Search className="h-4 w-4 text-white/40" />
                      <span>Try Search</span>
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="col-span-12 lg:col-span-7 min-h-0 overflow-hidden bg-black/5">
              {!activeConversationId ? (
                <div className="h-full min-h-0 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="mx-auto h-24 w-24 rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center shadow-xl">
                      <Mail className="h-12 w-12 text-orange-300" />
                    </div>
                    <div className="mt-8 text-[46px] leading-[1.05] font-black tracking-[-0.03em] text-white/90">
                      Select a conversation
                    </div>
                    <p className="mt-2 text-white/45 text-[14px]">Click a thread from the left to open chat.</p>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-0 flex flex-col">
                  <div className="border-b border-white/10 bg-black/20 px-4 py-3 flex items-center justify-between">
                    <div className="text-white/90 font-semibold text-[14px]">Conversation: {activeConversationId}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:bg-white/5"
                      onClick={() => openConversation(activeConversationId)}
                      title="Refresh chat"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                    {messagesLoading ? (
                      <div className="text-white/60">Loading...</div>
                    ) : (
                      messages.map((m) => (
                        <div
                          key={m.id}
                          className={[
                            "max-w-[78%] rounded-2xl px-4 py-3 border",
                            m.direction === "outgoing"
                              ? "ml-auto bg-orange-500/15 border-orange-500/25"
                              : "mr-auto bg-white/5 border-white/10",
                          ].join(" ")}
                        >
                          <div className="text-[13px] text-white/90 whitespace-pre-wrap">{m.message_text || ""}</div>
                          <div className="mt-1 text-[11px] text-white/40">
                            {new Date(m.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-white/10 bg-black/10 p-4 flex gap-2">
                    <Input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type a reply..."
                      className="bg-black/20 border-white/10 text-[13px] h-11"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendReply();
                      }}
                    />
                    <Button className="bg-orange-600 hover:bg-orange-700 h-11" onClick={sendReply}>
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-[760px] bg-white text-black border-black/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-[20px] font-bold">
              <List className="h-5 w-5 text-black/80" />
              Configure Default Inboxes
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between py-2">
              <div className="text-[16px]">Inboxes By Tags</div>
              <Toggle checked={cfgInboxesByTags} onCheckedChange={setCfgInboxesByTags} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="text-[16px]">Inboxes by Connections</div>
              <Toggle checked={cfgInboxesByConnections} onCheckedChange={setCfgInboxesByConnections} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="text-[16px]">My Inbox by Date</div>
              <Toggle checked={cfgMyInboxByDate} onCheckedChange={setCfgMyInboxByDate} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="text-[16px]">Load All Inboxes At Start</div>
              <Toggle checked={cfgLoadAllAtStart} onCheckedChange={setCfgLoadAllAtStart} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6">
            <Button variant="ghost" onClick={() => setConfigOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onSaveConfig}>
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>

          <button
            onClick={() => setConfigOpen(false)}
            className="absolute right-4 top-4 text-black/50 hover:text-black"
            aria-label="Close"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={addViewOpen} onOpenChange={setAddViewOpen}>
        <DialogContent className="max-w-[860px] bg-[#0B1220] text-white border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-300" />
              Add Inbox View
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            <div className="text-[13px] font-semibold text-white/80">Inbox Type</div>

            <Tabs value={addViewTab} onValueChange={(v) => setAddViewTab(v as any)}>
              <TabsList className="w-full justify-between bg-black/30 border border-white/10">
                <TabsTrigger value="user" className="w-full">User View</TabsTrigger>
                <TabsTrigger value="tag" className="w-full">Tag View</TabsTrigger>
                <TabsTrigger value="team" className="w-full">Team View</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="ghost" onClick={() => setAddViewOpen(false)} className="text-white/70 hover:bg-white/5">
                Cancel
              </Button>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Check className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          <button
            onClick={() => setAddViewOpen(false)}
            className="absolute right-4 top-4 text-white/40 hover:text-white"
            aria-label="Close"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
