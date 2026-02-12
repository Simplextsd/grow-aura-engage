import { Inbox, User2, Folder, Tag, ChevronDown, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export type UniboxItemKey =
  | "my_inbox"
  | "all_assigned"
  | "unassigned"
  | "all_awaiting_reply"
  | "by_connection"
  | "by_general"
  | "by_onboarding";

export function UniboxSidebar({
  collapsed,
  onToggleCollapsed,
  activeKey,
  onSelect,
  onNewView,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  activeKey: UniboxItemKey;
  onSelect: (k: UniboxItemKey) => void;
  onNewView: () => void;
}) {
  const W = collapsed ? "w-[84px]" : "w-[320px]";

  return (
    <div className={`${W} h-full bg-[#0A0D14] border-r border-white/5 flex flex-col`}>
      {/* Top: UNIBOX + icons (settings etc placeholders) */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-xl font-black tracking-wide">UNIBOX</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hover:bg-white/5" onClick={onToggleCollapsed}>
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <SideItem
          collapsed={collapsed}
          icon={<Inbox className="h-5 w-5" />}
          label="My Inbox"
          active={activeKey === "my_inbox"}
          onClick={() => onSelect("my_inbox")}
        />
        <SideItem
          collapsed={collapsed}
          icon={<User2 className="h-5 w-5" />}
          label="All Assigned"
          active={activeKey === "all_assigned"}
          onClick={() => onSelect("all_assigned")}
        />
        <SideItem
          collapsed={collapsed}
          icon={<Folder className="h-5 w-5" />}
          label="Unassigned"
          active={activeKey === "unassigned"}
          onClick={() => onSelect("unassigned")}
        />
        <SideItem
          collapsed={collapsed}
          icon={<Tag className="h-5 w-5" />}
          label="All Awaiting Reply"
          active={activeKey === "all_awaiting_reply"}
          onClick={() => onSelect("all_awaiting_reply")}
        />

        {/* My Views */}
        <div className="pt-5">
          {!collapsed && <div className="text-white/70 font-semibold mb-2">My Views</div>}
          <button
            onClick={onNewView}
            className={[
              "w-full h-11 rounded-xl border border-dashed border-white/15 hover:bg-white/5 transition flex items-center justify-center gap-2",
              collapsed ? "px-0" : "px-4",
            ].join(" ")}
          >
            <Plus className="h-5 w-5" />
            {!collapsed && <span className="font-semibold">New View</span>}
          </button>
        </div>

        {/* Groups */}
        <div className="pt-4 space-y-2">
          <GroupRow collapsed={collapsed} label="By connection" onClick={() => onSelect("by_connection")} />
          <GroupRow collapsed={collapsed} label="By general" onClick={() => onSelect("by_general")} />
          <GroupRow collapsed={collapsed} label="By onboarding" onClick={() => onSelect("by_onboarding")} />
        </div>
      </div>

      <div className="mt-auto p-3 text-xs text-white/30">
        {!collapsed ? "Getting Started with Inbox" : " "}
      </div>
    </div>
  );
}

function SideItem({
  collapsed,
  icon,
  label,
  active,
  onClick,
}: {
  collapsed: boolean;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full h-12 rounded-2xl transition flex items-center gap-3 px-3",
        active ? "bg-white text-black" : "text-white/85 hover:bg-white/5",
      ].join(" ")}
    >
      <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-black/20 border border-white/10">
        {icon}
      </div>
      {!collapsed && <div className="font-semibold">{label}</div>}
    </button>
  );
}

function GroupRow({
  collapsed,
  label,
  onClick,
}: {
  collapsed: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full h-11 rounded-xl hover:bg-white/5 transition flex items-center justify-between px-3 text-white/75"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-black/20 border border-white/10">
          <Tag className="h-5 w-5" />
        </div>
        {!collapsed && <span className="font-semibold">{label}</span>}
      </div>
      {!collapsed && <ChevronDown className="h-4 w-4 opacity-70" />}
    </button>
  );
}
