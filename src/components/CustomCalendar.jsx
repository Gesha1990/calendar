import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import React, { useCallback, useState, useMemo } from 'react'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

const localizer = momentLocalizer(moment)
const DnDCalendar = withDragAndDrop(Calendar)
const events = [
    {
        id: 0,
        title: 'All Day Event very long title',
        allDay: true,
        start: new Date(2024, 9, 25),
        end: new Date(2024, 9, 26),
    },
]
const formatName = (name, count) => `${name} ID ${count}`

export const CustomCalendar = () => {
    const [myEvents, setEvents] = useState(events)
    const [draggedEvent, setDraggedEvent] = useState()
    const [displayDragItemInCell, setDisplayDragItemInCell] = useState(true)
    const [counters, setCounters] = useState({ item1: 0, item2: 0 })
    const eventPropGetter = useCallback(
        (event) => ({
            ...(event.isDraggable
                ? { className: 'isDraggable' }
                : { className: 'nonDraggable' }),
        }),
        []
    )
    const handleDragStart = useCallback((event) => setDraggedEvent(event), [])

    const dragFromOutsideItem = useCallback(
        () => (draggedEvent === 'undroppable' ? null : draggedEvent),
        [draggedEvent]
    )
    const handleSelectSlot = useCallback(
        ({ start, end }) => {
            const title = window.prompt('New Event Name')
            if (title) {
                setEvents((prev) => [...prev, { start, end, title }])
            }
        },
        [setEvents]
    )
    const customOnDragOverFromOutside = useCallback(
        (dragEvent) => {
            if (draggedEvent !== 'undroppable') {
                console.log('preventDefault')
                dragEvent.preventDefault()
            }
        },
        [draggedEvent]
    )
    const handleSelectEvent = useCallback(
        (event) => window.alert(event.title),
        []
    )
    const moveEvent = useCallback(
        ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
            const { allDay } = event
            if (!allDay && droppedOnAllDaySlot) {
                event.allDay = true
            }

            setEvents((prev) => {
                const existing = prev.find((ev) => ev.id === event.id) ?? {}
                const filtered = prev.filter((ev) => ev.id !== event.id)
                return [...filtered, { ...existing, start, end, allDay }]
            })
        },
        [setEvents]
    )
    const newEvent = useCallback(
        (event) => {
            setEvents((prev) => {
                const idList = prev.map((item) => item.id)
                const newId = Math.max(...idList) + 1
                return [...prev, { ...event, id: newId }]
            })
        },
        [setEvents]
    )
    const { defaultDate, scrollToTime } = useMemo(
        () => ({
            defaultDate: new Date(2024, 3, 12),
            scrollToTime: new Date(1924, 1, 1, 6),
        }),
        []
    )
    const onDropFromOutside = useCallback(
        ({ start, end, allDay: isAllDay }) => {
            if (draggedEvent === 'undroppable') {
                setDraggedEvent(null)
                return
            }

            const { name } = draggedEvent
            const event = {
                title: formatName(name, counters[name]),
                start,
                end,
                isAllDay,
            }
            setDraggedEvent(null)
            setCounters((prev) => {
                const { [name]: count } = prev
                return {
                    ...prev,
                    [name]: count + 1,
                }
            })
            newEvent(event)
        },
        [draggedEvent, counters, setDraggedEvent, setCounters, newEvent]
    )

    const resizeEvent = useCallback(
        ({ event, start, end }) => {
            setEvents((prev) => {
                const existing = prev.find((ev) => ev.id === event.id) ?? {}
                const filtered = prev.filter((ev) => ev.id !== event.id)
                return [...filtered, { ...existing, start, end }]
            })
        },
        [setEvents]
    )
    return (
        <>
            <DnDCalendar
                defaultDate={defaultDate}
                defaultView={Views.MONTH}
                events={myEvents}
                localizer={localizer}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                scrollToTime={scrollToTime}
                style={{ height: 500 }}
                dragFromOutsideItem={
                    displayDragItemInCell ? dragFromOutsideItem : null
                }
                eventPropGetter={eventPropGetter}
                onDropFromOutside={onDropFromOutside}
                onDragOverFromOutside={customOnDragOverFromOutside}
                onEventDrop={moveEvent}
                onEventResize={resizeEvent}
                resizable
                draggableAccessor={(event) => true}
            />
        </>
    )
}
