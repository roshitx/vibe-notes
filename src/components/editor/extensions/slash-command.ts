import { Extension } from "@tiptap/core";
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react"; // Correct import for ReactRenderer
import tippy, { Instance, Props } from "tippy.js";
import { SlashCommandList } from "@/components/editor/slash-command-list";
import { PluginKey } from "@tiptap/pm/state"; // pm = ProseMirror

// Helper to render the suggestion list using React
const renderItems = () => {
  let component: ReactRenderer<any>;
  let popup: Instance[];

  return {
    onStart: (props: any) => {
      // Create a ReactRenderer instance to render the list component
      // We pass the editor and other props to it
      component = new ReactRenderer(SlashCommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      // Create the Tippy popup
      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },

    onUpdate: (props: any) => {
      component.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown: (props: any) => {
        if (props.event.key === 'Escape') {
            popup[0].hide();
            return true;
        }
        // Pass keydown events to the React component (for navigation)
        // @ts-ignore
        return component.ref?.onKeyDown(props);
    },

    onExit: () => {
      popup[0].destroy();
      component.destroy();
    },
  };
};

// Define the Command Item interface
export interface CommandItemProps {
    title: string;
    description?: string;
    icon: React.ElementType;
    command: (params: { editor: any; range: any }) => void;
}

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
        render: renderItems, // Use the renderItems helper defined in the file
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
