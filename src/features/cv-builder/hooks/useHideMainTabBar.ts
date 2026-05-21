import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

const MAIN_TAB_ROUTE_NAMES = ['dashboard', 'saved', 'cv-builder', 'admin'];

function isMainTabsNavigator(parent: NavigationProp<ParamListBase>): boolean {
  const state = parent.getState();
  if (!state || !('routeNames' in state)) return false;
  const names = state.routeNames as string[];
  return MAIN_TAB_ROUTE_NAMES.some((name) => names.includes(name));
}

/** Hides the app-wide bottom tabs while editing a CV so only the CV hub bar shows. */
export function useHideMainTabBar() {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      let parent = navigation.getParent();
      let mainTabs: NavigationProp<ParamListBase> | undefined;

      while (parent) {
        if (isMainTabsNavigator(parent)) {
          mainTabs = parent;
          break;
        }
        parent = parent.getParent();
      }

      if (mainTabs) {
        mainTabs.setOptions({ tabBarStyle: { display: 'none' } });
      }

      return () => {
        if (mainTabs) {
          mainTabs.setOptions({ tabBarStyle: undefined });
        }
      };
    }, [navigation]),
  );
}
