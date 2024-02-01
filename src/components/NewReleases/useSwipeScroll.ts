import { useState, useEffect, useCallback, RefObject } from 'react'

interface UseSwipeScrollParams {
	sliderRef: RefObject<HTMLElement>
	reliants?: any[]
	momentumVelocity?: number
}

function useSwipeScroll({
	sliderRef,
	reliants = [],
	momentumVelocity = 0.5
}: UseSwipeScrollParams) {
	const [hasSwiped, setHasSwiped] = useState<boolean>(false)

	const init = useCallback(() => {
		const slider = sliderRef.current
		if (!slider) {
			return
		}

		let isDown = false
		let startX: number
		let scrollLeft: number
		let velX = 0
		let momentumID: number

		const onMouseDown = (e: MouseEvent) => {
			isDown = true
			slider.classList.add('active')
			startX = e.pageX - slider.offsetLeft
			scrollLeft = slider.scrollLeft
			cancelMomentumTracking()
		}

		const onMouseLeave = () => {
			isDown = false
			slider.classList.remove('active')
		}

		const onMouseUp = () => {
			isDown = false
			slider.classList.remove('active')
			beginMomentumTracking()
			setTimeout(() => setHasSwiped(false), 0)
		}

		const onMouseMove = (e: MouseEvent) => {
			if (!isDown) return
			e.preventDefault()
			const x = e.pageX - slider.offsetLeft
			const walk = (x - startX) * 3 // scroll-fast
			const prevScrollLeft = slider.scrollLeft
			slider.scrollLeft = scrollLeft - walk
			velX = slider.scrollLeft - prevScrollLeft
			if (slider.scrollLeft - prevScrollLeft && !hasSwiped) {
				setHasSwiped(true)
			}
		}

		const onWheel = () => {
			cancelMomentumTracking()
		}

		const beginMomentumTracking = () => {
			cancelMomentumTracking()
			momentumID = window.requestAnimationFrame(momentumLoop)
		}

		const cancelMomentumTracking = () => {
			window.cancelAnimationFrame(momentumID)
		}

		const momentumLoop = () => {
			slider.scrollLeft += velX
			velX *= momentumVelocity
			if (Math.abs(velX) > 0.5) {
				momentumID = window.requestAnimationFrame(momentumLoop)
			}
		}

		// Attach event listeners
		slider.addEventListener('mousedown', onMouseDown)
		slider.addEventListener('mouseleave', onMouseLeave)
		slider.addEventListener('mouseup', onMouseUp)
		slider.addEventListener('mousemove', onMouseMove)
		slider.addEventListener('wheel', onWheel)

		// Cleanup function
		return () => {
			slider.removeEventListener('mousedown', onMouseDown)
			slider.removeEventListener('mouseleave', onMouseLeave)
			slider.removeEventListener('mouseup', onMouseUp)
			slider.removeEventListener('mousemove', onMouseMove)
			slider.removeEventListener('wheel', onWheel)
			cancelMomentumTracking()
		}
	}, [...reliants, sliderRef])

	useEffect(() => {
		const cleanup = init()
		return () => {
			if (cleanup) cleanup()
		}
	}, [init])

	return {
		hasSwiped
	}
}

export default useSwipeScroll
