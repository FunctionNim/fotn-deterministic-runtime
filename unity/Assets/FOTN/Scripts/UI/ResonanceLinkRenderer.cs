using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

namespace FOTN.UI
{
    public enum ResonanceLinkKind
    {
        Synchronize,
        Feed,
        Oppose,
        Restore,
        Neutral,
    }

    public sealed class ResonanceLinkRenderer : MonoBehaviour
    {
        [SerializeField] private UIDocument document;

        private VisualElement root;
        private VisualElement linkLayer;

        private readonly List<VisualElement> activeLinks = new();

        private void Awake()
        {
            if (document == null)
            {
                document = GetComponent<UIDocument>();
            }

            root = document.rootVisualElement;
            linkLayer = root.Q<VisualElement>("resonance-link-layer");
        }

        public void ClearLinks()
        {
            if (linkLayer == null) return;

            foreach (var link in activeLinks)
            {
                linkLayer.Remove(link);
            }

            activeLinks.Clear();
        }

        public void RenderLink(string sourceSlotName, string targetSlotName, ResonanceLinkKind kind)
        {
            if (linkLayer == null) return;

            var link = new VisualElement
            {
                name = $"resonance-link-{sourceSlotName}-{targetSlotName}",
            };

            link.AddToClassList("resonance-link");
            link.AddToClassList(ClassFor(kind));

            linkLayer.Add(link);
            activeLinks.Add(link);
        }

        private static string ClassFor(ResonanceLinkKind kind)
        {
            return kind switch
            {
                ResonanceLinkKind.Synchronize => "resonance-link--synchronize",
                ResonanceLinkKind.Feed => "resonance-link--feed",
                ResonanceLinkKind.Oppose => "resonance-link--oppose",
                ResonanceLinkKind.Restore => "resonance-link--restore",
                ResonanceLinkKind.Neutral => "resonance-link--neutral",
                _ => "resonance-link--neutral",
            };
        }
    }
}
