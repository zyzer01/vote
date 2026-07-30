import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Ban,
  ChevronDown,
  Layers,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Trophy,
  UserPlus,
} from "lucide-react"

import {
  deleteCategory,
  deleteNominee,
  disqualifyNominee,
} from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import {
  adminKeys,
  campaignDetailQuery,
  nomineesQuery,
} from "@/lib/api/admin-queries"
import type { AdminCategory, AdminNominee } from "@/lib/api/admin-types"
import { cn } from "@/lib/utils"
import { copyToClipboard, nomineeShareUrl } from "@/lib/share"
import { formatNumber } from "@/lib/format"
import { CategoryDialog } from "@/components/admin/category-dialog"
import { NomineeDialog } from "@/components/admin/nominee-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const Route = createFileRoute("/admin/campaigns/$campaignId/categories")({
  component: CategoriesPage,
})

function CategoriesPage() {
  const { campaignId } = Route.useParams()
  const { data: campaign } = useSuspenseQuery(campaignDetailQuery(campaignId))
  const categories = campaign.categories

  const [dialog, setDialog] = useState<{ category?: AdminCategory } | null>(null)
  const [expanded, setExpanded] = useState<string | null>(
    categories[0]?.id ?? null,
  )

  const readyCount = categories.filter(
    (c) => c.status === "ACTIVE" && (c._count?.nominees ?? 0) >= 2,
  ).length

  return (
    <div>
      {/* Publish checklist */}
      {campaign.status === "DRAFT" ? (
        <div className="border-primary/30 bg-primary/5 mb-6 flex flex-wrap items-center gap-3 rounded-xl border p-4">
          <div className="bg-primary/15 text-primary grid size-9 place-items-center rounded-lg">
            <Trophy className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Ready to publish?</p>
            <p className="text-muted-foreground text-xs">
              Each active category needs at least 2 nominees. {readyCount} of{" "}
              {categories.length} categor
              {categories.length === 1 ? "y is" : "ies are"} ready.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">
          Categories
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            {categories.length}
          </span>
        </h2>
        <Button size="sm" onClick={() => setDialog({})} className="font-semibold">
          <Plus className="size-4" />
          Add category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="border-border/70 mt-5 grid place-items-center rounded-2xl border border-dashed py-16 text-center">
          <div className="bg-muted text-muted-foreground grid size-14 place-items-center rounded-2xl">
            <Layers className="size-7" />
          </div>
          <h3 className="font-heading mt-4 text-lg font-semibold">
            No categories yet
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            Add your first category, like "Player of the Season" - then add its
            nominees.
          </p>
          <Button className="mt-5 font-semibold" onClick={() => setDialog({})}>
            <Plus className="size-4" />
            Add category
          </Button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              campaignId={campaignId}
              organizationCode={campaign.voteOrganization.code}
              campaignSlug={campaign.slug}
              category={category}
              expanded={expanded === category.id}
              onToggle={() =>
                setExpanded((id) => (id === category.id ? null : category.id))
              }
              onEdit={() => setDialog({ category })}
            />
          ))}
        </div>
      )}

      <CategoryDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        campaignId={campaignId}
        category={dialog?.category}
      />
    </div>
  )
}

function CategoryRow({
  campaignId,
  organizationCode,
  campaignSlug,
  category,
  expanded,
  onToggle,
  onEdit,
}: {
  campaignId: string
  organizationCode: string
  campaignSlug: string
  category: AdminCategory
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
}) {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const nomineeCount = category._count?.nominees ?? 0

  const removeCategory = useMutation({
    mutationFn: () => deleteCategory(category.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.campaign(campaignId) })
      queryClient.invalidateQueries({
        queryKey: adminKeys.categories(campaignId),
      })
      toast.success("Category deleted")
      setConfirmDelete(false)
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Couldn't delete category"),
  })

  return (
    <div className="border-border/70 bg-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onToggle}
          className="hover:bg-muted -m-1 grid size-8 shrink-0 place-items-center rounded-lg transition-colors"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronDown
            className={cn(
              "text-muted-foreground size-4 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>

        <button onClick={onToggle} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-heading truncate font-semibold">
              {category.name}
            </span>
            {category.status !== "ACTIVE" ? (
              <Badge variant="secondary">{category.status.toLowerCase()}</Badge>
            ) : nomineeCount < 2 ? (
              <Badge variant="warning">needs {2 - nomineeCount} more</Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground text-xs">
            {nomineeCount} nominee{nomineeCount === 1 ? "" : "s"}
          </p>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Category actions">
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded ? (
        <div className="border-border/60 border-t p-4">
          <NomineeManager
            campaignId={campaignId}
            organizationCode={organizationCode}
            campaignSlug={campaignSlug}
            categoryId={category.id}
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => removeCategory.mutate()}
        loading={removeCategory.isPending}
        destructive
        title={`Delete "${category.name}"?`}
        description="This removes the category and its nominees. Categories with votes can't be deleted."
        confirmLabel="Delete category"
      />
    </div>
  )
}

function NomineeManager({
  campaignId,
  organizationCode,
  campaignSlug,
  categoryId,
}: {
  campaignId: string
  organizationCode: string
  campaignSlug: string
  categoryId: string
}) {
  const { data: nominees, isLoading } = useQuery(nomineesQuery(categoryId))
  const [dialog, setDialog] = useState<{ nominee?: AdminNominee } | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-muted-foreground text-sm font-medium">Nominees</h3>
        <Button size="sm" variant="outline" onClick={() => setDialog({})}>
          <UserPlus className="size-4" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
          <Spinner className="size-4" />
          Loading nominees…
        </div>
      ) : !nominees || nominees.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          No nominees yet. Add at least 2 so this category can go live.
        </p>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {nominees.map((nominee) => (
            <NomineeRow
              key={nominee.id}
              campaignId={campaignId}
              organizationCode={organizationCode}
              campaignSlug={campaignSlug}
              categoryId={categoryId}
              nominee={nominee}
              onEdit={() => setDialog({ nominee })}
            />
          ))}
        </div>
      )}

      <NomineeDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        campaignId={campaignId}
        categoryId={categoryId}
        nominee={dialog?.nominee}
      />
    </div>
  )
}

function NomineeRow({
  campaignId,
  organizationCode,
  campaignSlug,
  categoryId,
  nominee,
  onEdit,
}: {
  campaignId: string
  organizationCode: string
  campaignSlug: string
  categoryId: string
  nominee: AdminNominee
  onEdit: () => void
}) {
  const queryClient = useQueryClient()
  const [confirm, setConfirm] = useState<null | "disqualify" | "delete">(null)
  const disqualified = nominee.status === "DISQUALIFIED"

  // Every nominee has a page of their own so they can campaign with a link
  // that can't send supporters to the wrong name on the ballot.
  const voteLink = nomineeShareUrl({
    organizationCode,
    campaignSlug,
    categoryId,
    nomineeSlug: nominee.slug,
  })

  async function copyVoteLink() {
    if (await copyToClipboard(voteLink)) {
      toast.success(`Copied ${nominee.displayName}'s vote link`, {
        description: voteLink,
      })
    } else {
      toast.error("Couldn't copy the link", { description: voteLink })
    }
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.nominees(categoryId) })
    queryClient.invalidateQueries({ queryKey: adminKeys.campaign(campaignId) })
  }

  const disqualify = useMutation({
    mutationFn: () => disqualifyNominee(nominee.id),
    onSuccess: () => {
      invalidate()
      toast.success("Nominee disqualified")
      setConfirm(null)
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Couldn't disqualify"),
  })

  const remove = useMutation({
    mutationFn: () => deleteNominee(nominee.id),
    onSuccess: () => {
      invalidate()
      toast.success("Nominee removed")
      setConfirm(null)
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Couldn't delete nominee"),
  })

  return (
    <div
      className={cn(
        "border-border/70 flex items-center gap-3 rounded-xl border p-2.5",
        disqualified && "opacity-60",
      )}
    >
      {nominee.imageUrl ? (
        <img
          src={nominee.imageUrl}
          alt=""
          className={cn(
            "size-10 shrink-0 rounded-lg object-cover",
            disqualified && "grayscale",
          )}
        />
      ) : (
        <span className="bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-lg">
          <Trophy className="size-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{nominee.displayName}</p>
        <p className="text-muted-foreground text-xs">
          {formatNumber(nominee.tally?.votes ?? 0)} votes
          {disqualified ? " · disqualified" : ""}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Nominee actions">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuItem onClick={copyVoteLink}>
            <Link2 className="size-4" />
            Copy vote link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          {!disqualified ? (
            <DropdownMenuItem onClick={() => setConfirm("disqualify")}>
              <Ban className="size-4" />
              Disqualify
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirm("delete")}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirm === "disqualify"}
        onClose={() => setConfirm(null)}
        onConfirm={() => disqualify.mutate()}
        loading={disqualify.isPending}
        title={`Disqualify ${nominee.displayName}?`}
        description="They stay on the ballot as disqualified and keep their recorded votes, but can't receive new ones."
        confirmLabel="Disqualify"
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove.mutate()}
        loading={remove.isPending}
        destructive
        title={`Delete ${nominee.displayName}?`}
        description="This removes the nominee. Nominees with votes can't be deleted -disqualify them instead."
        confirmLabel="Delete"
      />
    </div>
  )
}
