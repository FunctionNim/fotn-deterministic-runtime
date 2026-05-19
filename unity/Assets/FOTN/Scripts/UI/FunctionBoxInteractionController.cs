using UnityEngine;
using UnityEngine.UIElements;

namespace FOTN.UI
{
    public sealed class FunctionBoxInteractionController : MonoBehaviour
    {
        [SerializeField] private UIDocument document;

        private VisualElement functionBox;
        private VisualElement selectedSlot;

        private void Awake()
        {
            if (document == null)
            {
                document = GetComponent<UIDocument>();
            }

            functionBox = document.rootVisualElement.Q<VisualElement>("function-box");
            RegisterSlotCallbacks();
        }

        private void RegisterSlotCallbacks()
        {
            if (functionBox == null) return;

            var slots = functionBox.Query<Button>(className: "function-slot").ToList();

            foreach (var slot in slots)
            {
                slot.RegisterCallback<PointerEnterEvent>(_ => slot.AddToClassList("function-slot--hover"));
                slot.RegisterCallback<PointerLeaveEvent>(_ => slot.RemoveFromClassList("function-slot--hover"));
                slot.RegisterCallback<ClickEvent>(_ => SelectSlot(slot));
            }
        }

        private void SelectSlot(VisualElement slot)
        {
            if (selectedSlot != null)
            {
                selectedSlot.RemoveFromClassList("function-slot--selected");
            }

            selectedSlot = slot;
            selectedSlot.AddToClassList("function-slot--selected");

            Debug.Log($"Selected {selectedSlot.name} for continuation construction.");
        }
    }
}
