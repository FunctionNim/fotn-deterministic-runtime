using UnityEngine;
using UnityEngine.UIElements;

namespace FOTN.UI
{
    public sealed class FunctionBoxDragController : MonoBehaviour
    {
        [SerializeField] private UIDocument document;

        private VisualElement functionBox;
        private VisualElement draggedSlot;
        private int draggedSlotIndex = -1;

        private void Awake()
        {
            if (document == null)
            {
                document = GetComponent<UIDocument>();
            }

            functionBox = document.rootVisualElement.Q<VisualElement>("function-box");
            RegisterDragCallbacks();
        }

        private void RegisterDragCallbacks()
        {
            if (functionBox == null) return;

            var slots = functionBox.Query<Button>(className: "function-slot").ToList();

            for (var index = 0; index < slots.Count; index++)
            {
                var slotIndex = index;
                var slot = slots[index];

                slot.RegisterCallback<PointerDownEvent>(_ => BeginDrag(slot, slotIndex));
                slot.RegisterCallback<PointerUpEvent>(_ => EndDrag(slotIndex));
            }
        }

        private void BeginDrag(VisualElement slot, int slotIndex)
        {
            draggedSlot = slot;
            draggedSlotIndex = slotIndex;
            draggedSlot.AddToClassList("function-slot--dragging");

            Debug.Log($"Beginning continuation rearrangement from slot {slotIndex + 1}.");
        }

        private void EndDrag(int targetSlotIndex)
        {
            if (draggedSlot == null) return;

            draggedSlot.RemoveFromClassList("function-slot--dragging");

            Debug.Log(
                $"Continuation rearranged from slot {draggedSlotIndex + 1} to slot {targetSlotIndex + 1}.");

            draggedSlot = null;
            draggedSlotIndex = -1;
        }
    }
}
