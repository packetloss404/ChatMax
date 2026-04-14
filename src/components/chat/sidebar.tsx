import { useChatStore } from "../../lib/store";
import { formatDate } from "../../lib/utils";
import { Plus, Trash2, Menu, MessageCircle, Image, Music, Mic, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const navigate = useNavigate();
  const {
    conversations,
    activeConversationId,
    addConversation,
    setActiveConversation,
    deleteConversation,
    sidebarOpen,
    setSidebarOpen,
    videoEnabled,
  } = useChatStore();

  const handleNewChat = () => {
    addConversation();
    navigate("/chat");
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    navigate("/chat");
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        navigate("/chat");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-70 bg-card border-r border-border z-40 md:static md:translate-x-0"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border space-y-2">
                <button
                  onClick={handleNewChat}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>
                <div className={`grid gap-2 ${videoEnabled ? "grid-cols-4" : "grid-cols-3"}`}>
                  <button
                    onClick={() => navigate("/tts")}
                    className="btn-secondary flex flex-col items-center gap-1 py-2 text-xs"
                    title="Text to Speech"
                  >
                    <Mic className="w-4 h-4" />
                    <span>TTS</span>
                  </button>
                  <button
                    onClick={() => navigate("/image")}
                    className="btn-secondary flex flex-col items-center gap-1 py-2 text-xs"
                    title="Image Generation"
                  >
                    <Image className="w-4 h-4" />
                    <span>Image</span>
                  </button>
                  <button
                    onClick={() => navigate("/music")}
                    className="btn-secondary flex flex-col items-center gap-1 py-2 text-xs"
                    title="Music Generation"
                  >
                    <Music className="w-4 h-4" />
                    <span>Music</span>
                  </button>
                  {videoEnabled && (
                    <button
                      onClick={() => navigate("/video")}
                      className="btn-secondary flex flex-col items-center gap-1 py-2 text-xs"
                      title="Video Generation"
                    >
                      <Video className="w-4 h-4" />
                      <span>Video</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-2">
                {conversations.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No conversations yet
                  </div>
                ) : (
                  <div className="space-y-1 px-2">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 group transition-colors ${
                          activeConversationId === conv.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-accent text-foreground"
                        }`}
                      >
                        <MessageCircle className="w-4 h-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm font-medium">
                            {conv.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(conv.updatedAt)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, conv.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border">
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full btn-secondary text-sm"
                >
                  Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-card border border-border shadow-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </>
  );
}
