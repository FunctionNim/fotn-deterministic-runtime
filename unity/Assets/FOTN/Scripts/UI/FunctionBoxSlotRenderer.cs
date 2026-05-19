using UnityEngine;
using UnityEngine.UIElements;

namespace FOTN.UI
{
    public sealed class FunctionBoxSlotRenderer : MonoBehaviour
    {
        [SerializeField] private UIDocument document;
        [SerializeField] private int slotCount = 10;

        private VisualElement functionBox;

        private void Awake()
        {
            if (document == null)
            {
                document = GetComponent<UIDocument>();
            }

            functionBox = document.rootVisualElement.Q<VisualElement>("function-box");
            RenderSlots();
        }

        private void RenderSlots()
        {
            if (functionBox == null) return;

            functionBox.Clear();

            for (var index = 0; index < slotCount; index++)
            {
                var slot = new Button
                {
                    text = (index + 1).ToString(),
                    name = $"function-slot-{index + 1}",
                };

                slot.AddToClassList("function-slot");
                slot.AddToClassList("function-slot--empty");

                var slotIndex = index;
                slot.clicked += () => OnSlotClicked(slotIndex);

                functionBox.Add(slot);
            }
        }

        private void OnSlotClicked(int slotIndex)
        {
            Debug.Log($"Function Box slot {slotIndex + 1} selected for causation construction.");
        }
    }
}
