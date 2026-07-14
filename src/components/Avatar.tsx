import type { Member } from '../data/mock'
import type { AvatarMember } from '../data/members'

type AvatarProps = {
  member: Member | AvatarMember
  size?: 'sm' | 'md' | 'lg'
  dimmed?: boolean
  ring?: boolean
  delay?: number
}

const sizes = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-[11px]',
  lg: 'h-11 w-11 text-xs',
}

export function Avatar({
  member,
  size = 'md',
  dimmed = false,
  ring = false,
  delay = 0,
}: AvatarProps) {
  return (
    <div
      className={`avatar-in relative inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white ${sizes[size]} ${
        dimmed ? 'opacity-40' : ''
      } ${ring ? 'ring-2 ring-[var(--surface-raised)]' : ''}`}
      style={{
        backgroundColor: member.color,
        animationDelay: `${delay}ms`,
      }}
      title={member.name}
      aria-label={member.name}
    >
      {member.initials}
    </div>
  )
}

type AvatarRowProps = {
  members: Array<Member | AvatarMember>
  size?: 'sm' | 'md' | 'lg'
  max?: number
  goingIds?: Set<string>
}

export function AvatarRow({
  members,
  size = 'sm',
  max,
  goingIds,
}: AvatarRowProps) {
  const shown = max ? members.slice(0, max) : members

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((m, i) => (
        <Avatar
          key={m.id}
          member={m}
          size={size}
          ring
          dimmed={goingIds ? !goingIds.has(m.id) : false}
          delay={40 * i}
        />
      ))}
    </div>
  )
}
