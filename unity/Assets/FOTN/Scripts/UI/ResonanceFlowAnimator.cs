using UnityEngine;
using UnityEngine.UIElements;

namespace FOTN.UI
{
    public sealed class ResonanceFlowAnimator : MonoBehaviour
    {
        [SerializeField] private UIDocument document;
        [SerializeField] private float pulseSpeed = 1f;

        private VisualElement linkLayer;
        private float time;

        private void Awake()
        {
            if (document == null)
            {
                document = GetComponent<UIDocument>();
            }

            linkLayer = document.rootVisualElement.Q<VisualElement>("resonance-link-layer");
        }

        private void Update()
        {
            if (linkLayer == null) return;

            time += Time.deltaTime * pulseSpeed;
            var pulse = Mathf.Abs(Mathf.Sin(time));

            var links = linkLayer.Query<VisualElement>(className: "resonance-link").ToList();

            foreach (var link in links)
            {
                var intensity = ResolveIntensity(link);
                link.style.opacity = Mathf.Clamp01(0.15f + pulse * intensity);
            }
        }

        private static float ResolveIntensity(VisualElement link)
        {
            if (link.ClassListContains("resonance-link--oppose")) return 1f;
            if (link.ClassListContains("resonance-link--feed")) return 0.65f;
            if (link.ClassListContains("resonance-link--synchronize")) return 0.45f;
            if (link.ClassListContains("resonance-link--restore")) return 0.3f;
            return 0.15f;
        }
    }
}
