import React, { useEffect } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface PassNetworkFilters {
	minPasses: number
	showFullNetwork: boolean
	minute: number
}

interface PassNetworkFiltersProps {
	maxMinute: number
	filters?: PassNetworkFilters
	onFiltersChange?: (filters: PassNetworkFilters) => void
}

const defaultFilters: PassNetworkFilters = {
	minPasses: 3,
	showFullNetwork: true,
	minute: 0,
}

const clampMinute = (value: number, maxMinute: number) =>
	Math.max(0, Math.min(value, maxMinute))

const PassNetworkFilters: React.FC<PassNetworkFiltersProps> = ({
	maxMinute,
	filters,
	onFiltersChange,
}) => {
	const [internalFilters, setInternalFilters] = React.useState<PassNetworkFilters>(
		defaultFilters
	)

	const currentFilters = filters ?? internalFilters
	const clampedMinute = clampMinute(currentFilters.minute, maxMinute)

	useEffect(() => {
		if (clampedMinute === currentFilters.minute) {
			return
		}

		const nextFilters = { ...currentFilters, minute: clampedMinute }

		if (!filters) {
			setInternalFilters(nextFilters)
		}

		onFiltersChange?.(nextFilters)
	}, [clampedMinute, currentFilters, filters, onFiltersChange])

	const updateFilters = (nextFilters: PassNetworkFilters) => {
		if (!filters) {
			setInternalFilters(nextFilters)
		}

		onFiltersChange?.(nextFilters)
	}

	return (
		<div className="space-y-4 rounded-md border border-slate-800 bg-slate-900/60 p-3">
			<div className="flex items-center gap-2 text-slate-200">
				<SlidersHorizontal className="h-4 w-4 text-slate-300" />
				<span className="text-xs font-semibold uppercase tracking-wide">
					Filtros
				</span>
			</div>
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label
						htmlFor="min-passes"
						className="text-sm font-medium text-slate-200"
					>
						Minimo de pases
					</Label>
					<span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
						{currentFilters.minPasses}
					</span>
				</div>
				<div className="flex items-center gap-2 text-xs text-slate-400">
					<span className="w-6 text-left">1</span>
					<Slider
						id="min-passes"
						min={1}
						max={20}
						step={1}
						value={[currentFilters.minPasses]}
						className="flex-1 [&_[data-slot=slider-range]]:bg-sky-400 [&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-thumb]]:border-sky-300"
						onValueChange={(value) =>
							updateFilters({
								...currentFilters,
								minPasses: value[0] ?? 1,
							})
						}
					/>
					<span className="w-6 text-right">20</span>
				</div>
			</div>

			<div className="space-y-4 border-t border-slate-800 pt-4">
				<div className="flex items-center gap-2">
					<Checkbox
						id="full-network"
						checked={currentFilters.showFullNetwork}
						onCheckedChange={(checked) =>
							updateFilters({
								...currentFilters,
								showFullNetwork: Boolean(checked),
							})
						}
					/>
					<Label
						htmlFor="full-network"
						className="text-sm font-medium text-slate-200"
					>
						Ver toda la red de pases
					</Label>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<Label
							htmlFor="minute-filter"
							className="text-sm font-medium text-slate-200"
						>
							Minuto
						</Label>
						<span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-200">
							{currentFilters.showFullNetwork ? "Todo" : clampedMinute}
						</span>
					</div>
					<div className="flex items-center gap-2 text-xs text-slate-400">
						<span className="w-6 text-left">0</span>
						<Slider
							id="minute-filter"
							min={0}
							max={maxMinute}
							step={1}
							disabled={currentFilters.showFullNetwork}
							value={[clampedMinute]}
							className="flex-1 [&_[data-slot=slider-range]]:bg-emerald-400 [&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-thumb]]:border-emerald-300"
							onValueChange={(value) =>
								updateFilters({
									...currentFilters,
									minute: value[0] ?? 0,
								})
							}
						/>
						<span className="w-8 text-right">{maxMinute}</span>
					</div>
				</div>
			</div>
		</div>
	)
}

export type { PassNetworkFilters }

export default PassNetworkFilters
