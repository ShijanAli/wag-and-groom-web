import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fullName, initials } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { User } from "@/types/models";

type AvatarUser = Pick<User, "firstName" | "lastName"> & { profilePhoto?: string | null };

export function UserAvatar({ user, className }: { user?: AvatarUser | null; className?: string }) {
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {user?.profilePhoto && <AvatarImage src={user.profilePhoto} alt={fullName(user)} className="object-cover" />}
      <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">{initials(user)}</AvatarFallback>
    </Avatar>
  );
}

/** Avatar + name + secondary line — the standard "person" cell in tables. */
export function UserCell({ user, secondary }: { user: AvatarUser; secondary?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar user={user} className="h-9 w-9" />
      <div className="min-w-0">
        <p className="truncate font-medium">{fullName(user)}</p>
        {secondary && <p className="truncate text-xs text-muted-foreground">{secondary}</p>}
      </div>
    </div>
  );
}
